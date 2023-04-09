use rand::Rng;

// Structure tetris game
// Defines size of tetris game field, game field, current tetromino, next tetromino
struct Tetris {
    // Game field size
    width: usize,
    height: usize,
    // Game field
    field: Vec<Vec<CellType>>,
    // Current tetromino
    current: Option<Tetromino>,
    // Next tetromino
    next: TetrominoType,
    // Random number generator
    rng: rand::rngs::ThreadRng,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
enum CellType {
    Empty,
    I,
    J,
    L,
    O,
    S,
    T,
    Z,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
enum Rotation {
    R0,
    R90,
    R180,
    R270,
}

impl Rotation {
    // Rotate left
    pub fn rotate_left(&self) -> Rotation {
        match self {
            Rotation::R0 => Rotation::R270,
            Rotation::R90 => Rotation::R0,
            Rotation::R180 => Rotation::R90,
            Rotation::R270 => Rotation::R180,
        }
    }
    // Rotate right
    pub fn rotate_right(&self) -> Rotation {
        match self {
            Rotation::R0 => Rotation::R90,
            Rotation::R90 => Rotation::R180,
            Rotation::R180 => Rotation::R270,
            Rotation::R270 => Rotation::R0,
        }
    }
}

// Implement + operator for rotation
impl std::ops::Add<Rotation> for Rotation {
    type Output = Rotation;
    fn add(self, other: Rotation) -> Rotation {
        match other {
            Rotation::R0 => self,
            Rotation::R90 => self.rotate_right(),
            Rotation::R180 => self.rotate_right().rotate_right(),
            Rotation::R270 => self.rotate_left(),
        }
    }
}

struct TetrominoMatrix {
    matrix: [[bool; 4]; 4],
    width: usize,
    height: usize,
}

impl TetrominoMatrix {
    // Get width of tetromino matrix considering rotation
    pub fn get_width(&self, rotation: &Rotation) -> usize {
        // Return width of tetromino matrix considering rotation
        match rotation {
            Rotation::R0 => self.width,
            Rotation::R90 => self.height,
            Rotation::R180 => self.width,
            Rotation::R270 => self.height,
        }
    }
    // Get height of tetromino matrix considering rotation
    pub fn get_height(&self, rotation: &Rotation) -> usize {
        // Return height of tetromino matrix considering rotation
        match rotation {
            Rotation::R0 => self.height,
            Rotation::R90 => self.width,
            Rotation::R180 => self.height,
            Rotation::R270 => self.width,
        }
    }
    // Get cell value of tetromino matrix considering rotation
    pub fn get_cell(&self, x: usize, y: usize, rotation: &Rotation) -> bool {
        // Return cell value of tetromino matrix considering rotation
        match rotation {
            Rotation::R0 => self.matrix[y][x],
            Rotation::R90 => self.matrix[self.height - x - 1][y],
            Rotation::R180 => self.matrix[self.height - y - 1][self.width - x - 1],
            Rotation::R270 => self.matrix[x][self.width - y - 1],
        }
    }
}

// Constant tetromino matrix for I in R0 rotation, matrix is always 4x4
const TETROMINO_I_R0: TetrominoMatrix = TetrominoMatrix {
    matrix: [
        [true, true, true, true],
        [false, false, false, false],
        [false, false, false, false],
        [false, false, false, false],
    ],
    width: 4,
    height: 1,
};

// Constant tetromino matrix for J in R0 rotation, matrix is always 4x4
const TETROMINO_J_R0: TetrominoMatrix = TetrominoMatrix {
    matrix: [
        [true, false, false, false],
        [true, true, true, false],
        [false, false, false, false],
        [false, false, false, false],
    ],
    width: 3,
    height: 2,
};

// Constant tetromino matrix for L in R0 rotation, matrix is always 4x4
const TETROMINO_L_R0: TetrominoMatrix = TetrominoMatrix {
    matrix: [
        [false, false, true, false],
        [true, true, true, false],
        [false, false, false, false],
        [false, false, false, false],
    ],
    width: 3,
    height: 2,
};

// Constant tetromino matrix for O in R0 rotation, matrix is always 4x4
const TETROMINO_O_R0: TetrominoMatrix = TetrominoMatrix {
    matrix: [
        [true, true, false, false],
        [true, true, false, false],
        [false, false, false, false],
        [false, false, false, false],
    ],
    width: 2,
    height: 2,
};

// Constant tetromino matrix for S in R0 rotation, matrix is always 4x4
const TETROMINO_S_R0: TetrominoMatrix = TetrominoMatrix {
    matrix: [
        [false, true, true, false],
        [true, true, false, false],
        [false, false, false, false],
        [false, false, false, false],
    ],
    width: 3,
    height: 2,
};

// Constant tetromino matrix for T in R0 rotation, matrix is always 4x4
const TETROMINO_T_R0: TetrominoMatrix = TetrominoMatrix {
    matrix: [
        [false, true, false, false],
        [true, true, true, false],
        [false, false, false, false],
        [false, false, false, false],
    ],
    width: 3,
    height: 2,
};

// Constant tetromino matrix for Z in R0 rotation, matrix is always 4x4
const TETROMINO_Z_R0: TetrominoMatrix = TetrominoMatrix {
    matrix: [
        [true, true, false, false],
        [false, true, true, false],
        [false, false, false, false],
        [false, false, false, false],
    ],
    width: 3,
    height: 2,
};

// Get tetromino matrix by tetromino type
fn get_tetromino_matrix(tetromino_type: &TetrominoType) -> &TetrominoMatrix {
    // Return tetromino matrix by tetromino type
    match tetromino_type {
        TetrominoType::I => &TETROMINO_I_R0,
        TetrominoType::J => &TETROMINO_J_R0,
        TetrominoType::L => &TETROMINO_L_R0,
        TetrominoType::O => &TETROMINO_O_R0,
        TetrominoType::S => &TETROMINO_S_R0,
        TetrominoType::T => &TETROMINO_T_R0,
        TetrominoType::Z => &TETROMINO_Z_R0,
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
enum TetrominoType {
    I,
    J,
    L,
    O,
    S,
    T,
    Z,
}

impl TetrominoType {
    // new method returns new tetromino type
    pub fn new(rng: &mut impl rand::Rng) -> Self {
        // Create new tetromino type
        // Create random number between 0 and 6
        let random_number = rng.gen_range(0..7);
        // Return new tetromino type
        match random_number {
            0 => TetrominoType::I,
            1 => TetrominoType::J,
            2 => TetrominoType::L,
            3 => TetrominoType::O,
            4 => TetrominoType::S,
            5 => TetrominoType::T,
            6 => TetrominoType::Z,
            _ => TetrominoType::I,
        }
    }

    // Get tetromino width depending on rotation
    pub fn get_width(&self, rotation: &Rotation) -> usize {
        // Return tetromino width depending on rotation
        get_tetromino_matrix(self).get_width(rotation)
    }

    // Get tetromino height depending on rotation
    pub fn get_height(&self, rotation: &Rotation) -> usize {
        // Return tetromino height depending on rotation
        get_tetromino_matrix(self).get_height(rotation)
    }

    // Get cell value depending on rotation
    pub fn get_cell(&self, x: usize, y: usize, rotation: &Rotation) -> bool {
        // Return cell value depending on rotation
        get_tetromino_matrix(self).get_cell(x, y, rotation)
    }

    // Get cell type corresponding to tetromino type
    pub fn get_cell_type(&self) -> CellType {
        // Return cell type corresponding to tetromino type
        match self {
            TetrominoType::I => CellType::I,
            TetrominoType::J => CellType::J,
            TetrominoType::L => CellType::L,
            TetrominoType::O => CellType::O,
            TetrominoType::S => CellType::S,
            TetrominoType::T => CellType::T,
            TetrominoType::Z => CellType::Z,
        }
    }
}

struct Tetromino {
    // Tetromino type
    tetromino_type: TetrominoType,
    // Tetromino rotation
    rotation: Rotation,
    // Tetromino position
    x: isize,
    y: isize,
}

impl Tetromino {
    // new method accepts TetrominoType and returns new tetromino
    pub fn new(tetrominoType: TetrominoType, rotation: Rotation, x: isize, y: isize) -> Self {
        // Create new tetromino
        Tetromino {
            tetromino_type: tetrominoType,
            rotation: rotation,
            x: x,
            y: y,
        }
    }

    // Check if tetromino intersects with field borders or other tetrominos
    pub fn intersects(&self, field: &Vec<Vec<CellType>>) -> bool {
        // Check if tetromino intersects with field borders or other tetrominos
        // Check if tetromino position is positive, otherwise it intersects with field borders
        let x = if self.x >= 0 {
            self.x as usize
        } else {
            return true;
        };
        let y = if self.y >= 0 {
            self.y as usize
        } else {
            return true;
        };
        // Get tetromino width and height
        let width = self.tetromino_type.get_width(&self.rotation);
        let height = self.tetromino_type.get_height(&self.rotation);
        // Check if tetromino intersects with field borders
        if x + width > field[0].len() || y + height > field.len() {
            return true;
        }
        // Check if tetromino intersects with other tetrominos
        for cell_y in 0..height {
            for cell_x in 0..width {
                if self.tetromino_type.get_cell(cell_x, cell_y, &self.rotation)
                    && field[y + cell_y][x + cell_x] != CellType::Empty
                {
                    return true;
                }
            }
        }
        // Return false if tetromino does not intersect with field borders or other tetrominos
        false
    }

    // Draw tetromino on field. If tetromino intersects with field borders, draw it partially.
    // I.e for any cell position check is it inside field borders and if it is, draw it.
    pub fn draw(&self, field: &mut Vec<Vec<CellType>>) {
        // Draw tetromino on field
        // Get tetromino width and height
        let width = self.tetromino_type.get_width(&self.rotation);
        let height = self.tetromino_type.get_height(&self.rotation);
        let cell_type = self.tetromino_type.get_cell_type();
        // Draw tetromino on field
        for cell_y in 0..height {
            for cell_x in 0..width {
                if self.tetromino_type.get_cell(cell_x, cell_y, &self.rotation) {
                    // Get cell position. Use isize type to avoid overflow
                    // Check resulting positoins are positive and less than field borders
                    let x = self.x + cell_x as isize;
                    let y = self.y + cell_y as isize;
                    if x >= 0 && x < field[0].len() as isize && y >= 0 && y < field.len() as isize {
                        field[y as usize][x as usize] = cell_type;
                    }
                }
            }
        }
    }
}

impl Tetris {
    pub fn new(width: usize, height: usize) -> Self {
        // Create new tetris game
        // Create game field, functional style
        let field = (0..height)
            .map(|_| (0..width).map(|_| CellType::Empty).collect())
            .collect();

        // Create random number generator
        let mut rng = rand::thread_rng();

        // Create new tetris game
        Tetris {
            width,
            height,
            field,
            current: None,
            next: TetrominoType::new(&mut rng),
            rng,
        }
    }

    pub fn get_field(&self) -> &Vec<Vec<CellType>> {
        &self.field
    }

    pub fn get_current(&self) -> &Option<Tetromino> {
        &self.current
    }

    pub fn get_next(&self) -> &TetrominoType {
        &self.next
    }

    // Place new tetromino on the field. Return false if it's impossible to place new tetromino
    pub fn place_new_tetromino(&mut self) -> bool {
        // Place new tetromino on the field
        // Create new tetromino
        let new_tetromino = Tetromino::new(self.next, Rotation::R0, self.width as isize / 2 - 2, 0);
        // Check if new tetromino intersects with field borders or other tetrominos
        if new_tetromino.intersects(&self.field) {
            return false;
        }
        // Set new tetromino as current
        self.current = Some(new_tetromino);
        // Set new tetromino type as next
        self.next = TetrominoType::new(&mut self.rng);
        // Return true if new tetromino was placed on the field
        true
    }

    // Change position and rotation of current tetromino, if it's possible
    pub fn change_current_tetromino(&mut self, x: isize, y: isize, rotation: Rotation) -> bool {
        // Change position and rotation of current tetromino, if it's possible
        // Check if current tetromino exists
        let Some(current) = &mut self.current else {
            return false;
        };

        // Create new tetromino
        let new_tetromino = Tetromino::new(
            current.tetromino_type,
            current.rotation + rotation,
            current.x as isize + x,
            current.y as isize + y,
        );
        // Check if new tetromino intersects with field borders or other tetrominos
        if new_tetromino.intersects(&self.field) {
            return false;
        }
        *current = new_tetromino;
        return true;
    }

    // Move current tetromino down, if it's possible
    pub fn move_down(&mut self) -> bool {
        // Move current tetromino down, if it's possible
        self.change_current_tetromino(0, 1, Rotation::R0)
    }

    // Move current tetromino left, if it's possible
    pub fn move_left(&mut self) -> bool {
        // Move current tetromino left, if it's possible
        self.change_current_tetromino(-1, 0, Rotation::R0)
    }

    // Move current tetromino right, if it's possible
    pub fn move_right(&mut self) -> bool {
        // Move current tetromino right, if it's possible
        self.change_current_tetromino(1, 0, Rotation::R0)
    }

    // Rotate current tetromino left, if it's possible
    pub fn rotate_left(&mut self) -> bool {
        // Rotate current tetromino left, if it's possible
        self.change_current_tetromino(0, 0, Rotation::R270)
    }

    // Rotate current tetromino right, if it's possible
    pub fn rotate_right(&mut self) -> bool {
        // Rotate current tetromino right, if it's possible
        self.change_current_tetromino(0, 0, Rotation::R90)
    }

    // Draw current tetromino on the field
    pub fn draw_current(&mut self) {
        // Draw current tetromino on the field
        // Check if current tetromino exists
        if let Some(current) = &self.current {
            // Draw current tetromino on the field
            current.draw(&mut self.field);
        }
    }
}
