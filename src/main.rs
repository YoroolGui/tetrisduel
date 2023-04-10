mod error;
mod lru_storage;
mod tetris;

use crate::{lru_storage::LRUStorage, tetris::Tetris};
use error::Error;
use persy::Persy;
use rocket::{
    get,
    http::{Cookie, CookieJar},
    routes, Ignite, Rocket, State,
};
use rocket_dyn_templates::Template;

type Tetrises = LRUStorage<u32, Tetris>;

// Get user id from cookie, if cookie is not set, generate new user id and set cookie
fn user_id(cookie_jar: &CookieJar) -> u32 {
    // Get user id from cookie
    if let Some(user_id) = cookie_jar
        .get("user_id")
        .map(|v| v.value().parse::<u32>().ok())
        .flatten()
    {
        user_id
    } else {
        let user_id = rand::random::<u32>();
        cookie_jar.add(Cookie::new("user_id", user_id.to_string()));
        user_id
    }
}

// Root page handler, returns a string with html content
#[get("/")]
fn index(cookie_jar: &CookieJar, tetrises: &State<Tetrises>) -> String {
    // Access managed storage with type Tetrises
    let user_id = user_id(cookie_jar);
    tetrises.access_with_create(&user_id, || Some(Tetris::new(10, 20)), |_| ());

    // let _tetris = tetrises.get_mut_or_else(&user_id, || Tetris::new(10, 20));
    tetrises.len().to_string()
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
        // Mount index route
        .manage(tetrises)
        .mount("/", routes![index])
        // Mount admin route
        .mount("/", routes![admin])
        // Mount index route
        .mount("/", routes![files])
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
