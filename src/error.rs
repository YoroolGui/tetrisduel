use persy::PersyError;

// Define own error type
#[derive(Debug)]
pub enum Error {
    // Error type for Persy database errors
    PersyDatabaseError(persy::PersyError),
    // Error type for rocket errors
    RocketError(rocket::Error),
    // Error type for io::Result errors
    IoError(std::io::Error),
}

impl<T: Into<PersyError>> From<persy::PE<T>> for Error {
    fn from(err: persy::PE<T>) -> Self {
        match err {
            persy::PE::PE(err) => Error::PersyDatabaseError(err.into()),
        }
    }
}

impl From<persy::PersyError> for Error {
    fn from(err: persy::PersyError) -> Self {
        Error::PersyDatabaseError(err)
    }
}

impl From<rocket::Error> for Error {
    fn from(err: rocket::Error) -> Self {
        Error::RocketError(err)
    }
}

impl From<std::io::Error> for Error {
    fn from(err: std::io::Error) -> Self {
        Error::IoError(err)
    }
}

// Implement display trait for error type
impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Error::PersyDatabaseError(err) => write!(f, "Persy database error: {}", err),
            Error::RocketError(err) => write!(f, "Rocket error: {}", err),
            Error::IoError(err) => write!(f, "Io error: {}", err),
        }
    }
}
