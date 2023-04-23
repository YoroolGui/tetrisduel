mod error;
mod event_regulator;
mod matches;
mod tetris;
mod tetris_pair;

use std::sync::{Arc, RwLock};

use error::Error;
use matches::{MatchId, Matches, PlayerStatus};
use persy::Persy;
use rocket::tokio::select;
use rocket::tokio::time::{self, Duration};
use rocket::{
    get,
    http::{Cookie, CookieJar},
    response::{
        status,
        stream::{Event, EventStream},
    },
    routes,
    serde::json::serde_json,
    Ignite, Rocket, State,
};
use rocket::{post, Config, Shutdown};
use rocket_dyn_templates::Template;
use tetris::Action;
use tetris_pair::{TetrisPair, TetrisPairState};

struct TetrisMatches(Arc<RwLock<Matches<u32, TetrisPair>>>);

impl TetrisMatches {
    fn new() -> Self {
        TetrisMatches(Arc::new(RwLock::new(Matches::new())))
    }
    fn get_free_user_id(&self) -> u32 {
        let mut user_id = rand::random::<u32>();
        let matches = self.0.read().unwrap();
        while matches.get_player_status(&user_id) != PlayerStatus::NotFound {
            user_id = rand::random::<u32>();
        }
        user_id
    }
    fn game_state(&self, user_id: u32) -> Option<TetrisPairState> {
        let matches = self.0.read().unwrap();
        matches
            .get_match_for_player(&user_id)
            .and_then(|(_, tetris_match)| {
                let player_side = tetris_match.get_player_side(&user_id)?;
                Some(tetris_match.field.get_player_game_state(player_side))
            })
    }
    fn add_action(&self, user_id: u32, action: Action) {
        let mut matches = self.0.write().unwrap();
        if let Some((_, tetris_match)) = matches.get_mut_match_for_player(&user_id) {
            if let Some(player_side) = tetris_match.get_player_side(&user_id) {
                tetris_match.field.add_player_action(player_side, action);
            }
        }
    }
    fn step(&self, user_id: u32) -> Option<TetrisPairState> {
        let mut matches = self.0.write().unwrap();
        if matches.find_match(&user_id) {
            if let Some((match_id, tetris_match)) = matches.get_mut_match_for_player(&user_id) {
                if let Some(player_side) = tetris_match.get_player_side(&user_id) {
                    let divergence = tetris_match.field.step_player(player_side);
                    if divergence < 100 {
                        return Some(tetris_match.field.get_player_game_state(player_side));
                    } else {
                        matches.remove_match(match_id);
                    }
                }
            }
        }
        None
    }
}

// Get user id from cookie, if cookie is not set or user id is not valid, create new user id and set cookie
fn get_or_create_user_id(
    cookie_jar: &CookieJar,
    validate: impl FnOnce(u32) -> bool,
    create: impl FnOnce() -> u32,
) -> u32 {
    cookie_jar
        .get("user_id")
        .map(|v| v.value().parse::<u32>().ok())
        .flatten()
        .filter(|user_id| validate(*user_id))
        .unwrap_or_else(|| {
            let user_id = create();
            cookie_jar.add(Cookie::new("user_id", user_id.to_string()));
            user_id
        })
}

// Get user id by CookieJar and Users storage
fn user_id(cookie_jar: &CookieJar, tetris_matches: &TetrisMatches) -> u32 {
    get_or_create_user_id(
        cookie_jar,
        |_| true, // TODO: check for impersonation
        || tetris_matches.get_free_user_id(),
    )
}

// Root page handler, returns a string with html content
#[get("/")]
fn index(cookie_jar: &CookieJar, tetris_matches: &State<TetrisMatches>) -> String {
    // Access managed storage with type Tetrises
    let user_id = user_id(cookie_jar, tetris_matches);
    // tetrises.access_refresh_mut_with_create(&user_id, || Some(Tetris::new(10, 20)), |_| ());
    // let _tetris = tetrises.get_mut_or_else(&user_id, || Tetris::new(10, 20));
    // vec![user_id as usize, users.len()]
    //     .into_iter()
    //     .map(|v| v.to_string())
    //     .collect::<Vec<_>>()
    //     .join(" ")
    user_id.to_string()
}

// Returns game state as json. Returns HTTP error 404 if user is not found
#[get("/game_state")]
fn game_state(
    cookie_jar: &CookieJar,
    matches: &State<TetrisMatches>,
) -> Result<String, status::NotFound<String>> {
    let user_id = user_id(cookie_jar, matches);
    let game_state = matches.game_state(user_id);
    if let Some(game_state) = game_state {
        Ok(serde_json::to_string(&game_state).unwrap())
    } else {
        Err(status::NotFound("Game not found".to_string()))
    }
}

// Admin page, returns a handlebars template
#[get("/admin")]
fn admin() -> Template {
    let context = ();
    // Render admin/index.html.hbs template
    Template::render("admin/index", &context)
}

// Serve specified static file or index.html if only path is given, set rank = 2
#[get("/<file..>", rank = 2)]
async fn files(file: std::path::PathBuf) -> Option<rocket::fs::NamedFile> {
    // Split file to path and file name
    let path = file.parent().unwrap_or(std::path::Path::new(""));
    let file = file.file_name().unwrap_or(std::ffi::OsStr::new(""));

    // Serve static content of index.html if file is empty
    if file.is_empty() {
        rocket::fs::NamedFile::open(
            std::path::Path::new("static/")
                .join(path)
                .join("index.html"),
        )
        .await
        .ok()
    } else {
        rocket::fs::NamedFile::open(std::path::Path::new("static/").join(path).join(file))
            .await
            .ok()
    }
}

// Returns game state as EventStream
#[get("/sse")]
fn sse<'a, 'b>(
    cookie_jar: &'a CookieJar,
    matches: &'b State<TetrisMatches>,
) -> EventStream![Event + 'b] {
    let user_id = user_id(cookie_jar, matches);
    EventStream! {
        let mut interval = time::interval(Duration::from_millis(10));
        loop {
            if let Some(game_state) = matches.step(user_id) {
                // Send game state as json
                yield Event::data(serde_json::to_string(&game_state).unwrap());
                interval.tick().await;
            } else {
                yield Event::data("foo".to_string());
                time::sleep(Duration::from_millis(1000)).await;
                interval = time::interval(Duration::from_millis(10));
            }
        }
    }
}

// When /down url is requested, move tetris figure down
#[post("/down")]
fn down(cookie_jar: &CookieJar, matches: &State<TetrisMatches>) {
    let user_id = user_id(cookie_jar, matches);
    matches.add_action(user_id, Action::MoveDown);
}

// When /left url is requested, move tetris figure left
#[post("/left")]
fn left(cookie_jar: &CookieJar, matches: &State<TetrisMatches>) {
    let user_id = user_id(cookie_jar, matches);
    matches.add_action(user_id, Action::MoveLeft);
}

// When /right url is requested, move tetris figure right
#[post("/right")]
fn right(cookie_jar: &CookieJar, matches: &State<TetrisMatches>) {
    let user_id = user_id(cookie_jar, matches);
    matches.add_action(user_id, Action::MoveRight);
}

// When /rotate_right url is requested, rotate tetris figure right
#[post("/rotate_right")]
fn rotate_right(cookie_jar: &CookieJar, matches: &State<TetrisMatches>) {
    let user_id = user_id(cookie_jar, matches);
    matches.add_action(user_id, Action::RotateRight);
}

// When /rotate_left url is requested, rotate tetris figure left
#[post("/rotate_left")]
fn rotate_left(cookie_jar: &CookieJar, matches: &State<TetrisMatches>) {
    let user_id = user_id(cookie_jar, matches);
    matches.add_action(user_id, Action::RotateLeft);
}

// When /drop url is requested, drop tetris figure
#[post("/drop")]
fn drop(cookie_jar: &CookieJar, matches: &State<TetrisMatches>) {
    let user_id = user_id(cookie_jar, matches);
    matches.add_action(user_id, Action::Drop);
}

#[post("/bottom_refill")]
fn bottom_refill(cookie_jar: &CookieJar, matches: &State<TetrisMatches>) {
    let user_id = user_id(cookie_jar, matches);
    matches.add_action(user_id, Action::BottomRefill);
}

// .ok_or(status::NotFound("User not found".to_string()));
async fn init() -> Result<Rocket<Ignite>, Error> {
    // Get executable name without extension
    let exe_name = std::env::current_exe()?;
    // Remove extension
    let db_name = exe_name
        .file_stem()
        .map(|s| s.to_str())
        .flatten()
        .unwrap_or("gameserver");
    // make db name = executable name + ".db"
    let db_name = db_name.to_owned() + ".db";
    // create or open Persy database storage
    println!("Database file: {}", db_name);
    let config = persy::Config::default();
    Persy::open_or_create_with(db_name, config, |_persy| Ok(()))?;

    // Create matches storage
    let matches = TetrisMatches::new();

    // Start rocket server
    let rocket = rocket::build()
        // Read config from Rocket.toml
        .manage(Config::figment())
        // Attach Template::fairing() to rocket instance
        .attach(Template::fairing())
        // Matches
        .manage(matches)
        // Mount index route
        .mount("/", routes![index, admin, files, game_state])
        .mount(
            "/",
            routes![
                sse,
                down,
                left,
                right,
                rotate_right,
                rotate_left,
                drop,
                bottom_refill
            ],
        )
        .launch()
        .await?;
    Ok(rocket)
}

#[rocket::main]
async fn main() {
    // Handle result
    match init().await {
        Ok(_rocket) => println!("Server started successfully"),
        Err(e) => println!("Server failed to start: {}", e),
    }
}
