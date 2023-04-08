mod error;

use error::Error;
use persy::Persy;
use rocket::{get, routes, Ignite, Rocket};

// Define 'index' route
#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

async fn init() -> Result<Rocket<Ignite>, Error> {
    // Get executable name
    let exe_name = std::env::current_exe()?;
    // make db name = executable name + ".db"
    let db_name = exe_name.to_str().unwrap().to_owned() + ".db";
    // create Persy database storage
    Persy::create(db_name)?;
    // Start rocket server
    let rocket = rocket::build().mount("/", routes![index]).launch().await?;
    Ok(rocket)
}

// Init rocket server in a modern, asynchronous way
#[rocket::main]
async fn main() {
    // Handle result
    match init().await {
        Ok(_rocket) => println!("Server started successfully"),
        Err(e) => println!("Server failed to start: {}", e),
    }
}
