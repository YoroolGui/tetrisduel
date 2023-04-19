use crate::tetris::{Action, Tetris, TetrisGameState};

// This class allows 2 users to play tetris against each other
// It contains two tetris games and accepts commands from both users, each for it's own game
// When one gamer fills a line, the other gamer gets a randomly filled line from bottom of the field
enum Player {
    A,
    B,
}

pub struct TetrisPairMatch {
    tetris_a: Tetris,
    tetris_b: Tetris,
    // The step is performed when both players have called step method
    // This is to prevent one player from getting an advantage by calling step more often
    step_a: bool,
    step_b: bool,
}

impl TetrisPairMatch {
    pub fn new(width: usize, height: usize) -> TetrisPairMatch {
        TetrisPairMatch {
            tetris_a: Tetris::new(width, height),
            tetris_b: Tetris::new(width, height),
            step_a: false,
            step_b: false,
        }
    }

    pub fn step(&mut self, player: Player) {
        match player {
            Player::A => self.step_a = true,
            Player::B => self.step_b = true,
        }
        if self.step_a && self.step_b {
            self.step_a = false;
            self.step_b = false;
            let step_result_a = self.tetris_a.step();
            let step_result_b = self.tetris_b.step();
            // step_result_a and step_result_b have type StepResult
            // StepResult is an enum with 3 variants: None, LineFilled, Action, GameOver

            // If one of the players filled a line, the other player gets a randomly filled line from bottom of the field
        }
    }

    pub fn get_game_state(&self, player: Player) -> TetrisGameState {
        match player {
            Player::A => self.tetris_a.get_game_state(),
            Player::B => self.tetris_b.get_game_state(),
        }
    }

    pub fn add_action(&mut self, player: Player, action: Action) {
        match player {
            Player::A => self.tetris_a.add_action(action),
            Player::B => self.tetris_b.add_action(action),
        }
    }

    pub fn is_game_over(&self) -> bool {
        self.tetris_a.is_game_over() || self.tetris_b.is_game_over()
    }
}
