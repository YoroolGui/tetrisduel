use rocket::{get, routes};

// Define 'index' route
#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

// Init rocket server in a modern, asynchronous way
#[rocket::main]
async fn main() {
    let res = rocket::build().mount("/", routes![index]).launch().await;
    // Handle result
    match res {
        Ok(_) => println!("Server started successfully"),
        Err(e) => println!("Server failed to start: {}", e),
    }
}
