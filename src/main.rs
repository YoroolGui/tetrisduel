mod error;
mod lru_storage;
mod tetris;

use crate::{lru_storage::LRUStorage, tetris::Tetris};
use error::Error;
use persy::Persy;
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
use rocket_dyn_templates::Template;

type Tetrises = LRUStorage<u32, Tetris>;

// Get user id from cookie, if cookie is not set or user id is not valid, create new user id and set cookie
fn user_id(
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

// Validate user in Tetrises: return true if user exists
fn validate_tetris_user(tetrises: &Tetrises, user_id: u32) -> bool {
    tetrises.exists(&user_id)
}

// Create new user id in Tetrises
fn create_tetris_user(tetrises: &Tetrises) -> u32 {
    let mut user_id = rand::random::<u32>();
    while tetrises.exists(&user_id) {
        user_id = rand::random::<u32>();
    }
    tetrises.put(user_id, Tetris::new(10, 20));
    user_id
}

// Get user id by CookieJa and Tetris storage
fn tetris_user_id(cookie_jar: &CookieJar, tetrises: &Tetrises) -> u32 {
    user_id(
        cookie_jar,
        |id| validate_tetris_user(tetrises, id),
        || create_tetris_user(tetrises),
    )
}

// Root page handler, returns a string with html content
#[get("/")]
fn index(cookie_jar: &CookieJar, tetrises: &State<Tetrises>) -> String {
    // Access managed storage with type Tetrises
    let user_id = tetris_user_id(cookie_jar, tetrises);
    // tetrises.access_refresh_mut_with_create(&user_id, || Some(Tetris::new(10, 20)), |_| ());
    // let _tetris = tetrises.get_mut_or_else(&user_id, || Tetris::new(10, 20));
    vec![user_id as usize, tetrises.len()]
        .into_iter()
        .map(|v| v.to_string())
        .collect::<Vec<_>>()
        .join(" ")
}

// Returns game state as json. Returns HTTP error 404 if user is not found
#[get("/game_state")]
fn game_state(
    cookie_jar: &CookieJar,
    tetrises: &State<Tetrises>,
) -> Result<String, status::NotFound<String>> {
    let user_id = tetris_user_id(cookie_jar, tetrises);
    tetrises
        .access_refresh(&user_id, |tetris| {
            let tetris = tetris.map(|tetris| tetris.get_game_state());
            tetris.map(|tetris| serde_json::to_string(&tetris).unwrap())
        })
        .ok_or(status::NotFound("User not found".to_string()))
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
    tetrises: &'b State<Tetrises>,
) -> EventStream![Event + 'b] {
    let user_id = tetris_user_id(cookie_jar, tetrises);
    EventStream! {
        let mut interval = time::interval(Duration::from_millis(100));
        loop {
            if let Some(json) = tetrises.inner()
                .access_refresh_mut(&user_id, |opt_tetris| {
                    let opt_json = opt_tetris.map(|tetris| {
                        tetris.step();
                        tetris.get_game_state()
                    });
                    opt_json.map(|json| serde_json::to_string(&json).unwrap())
                }) {
                    yield Event::data(json);
                    interval.tick().await;
            } else {
                // End stream
                break;
            }
        }
    }
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

    // Create storage for tetris games
    let tetrises = Tetrises::new(1000);

    // Start rocket server
    let rocket = rocket::build()
        // Attach Template::fairing() to rocket instance
        .attach(Template::fairing())
        // Game statuses for users
        .manage(tetrises)
        // Mount index route
        .mount("/", routes![index, admin, files, game_state, sse])
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
