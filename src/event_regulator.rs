pub struct EventRegulator {
    m: usize,
    n: usize,
    current_step: usize,
    events_generated: usize,
}

impl EventRegulator {
    pub fn new(m: usize, n: usize) -> Self {
        EventRegulator {
            m,
            n,
            current_step: 0,
            events_generated: 0,
        }
    }

    pub fn get_m(&self) -> usize {
        self.m
    }

    pub fn get_n(&self) -> usize {
        self.n
    }

    pub fn set_mn(&mut self, m: usize, n: usize) {
        self.m = m;
        self.n = n;
        self.current_step = 0;
        self.events_generated = 0;
    }

    pub fn step(&mut self) -> usize {
        let events_to_generate_this_step =
            (self.m * (self.current_step + 1) + self.n - 1) / self.n - self.events_generated;

        self.events_generated += events_to_generate_this_step;

        self.current_step = (self.current_step + 1) % self.n;

        if self.current_step == 0 {
            self.events_generated = 0;
        }

        events_to_generate_this_step
    }
}
