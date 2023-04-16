//
// Structure to regutate event frequency
// Accepts two parameters m and n and generates n events during m steps, evenly distributed
//
struct EventRegulator {
    // Number of steps
    m: usize,
    // Number of events
    n: usize,
    // Current step
    current_step: usize,
    // Current event
    current_event: usize,
}

impl EventRegulator {
    // new method accepts m and n and returns new EventRegulator
    pub fn new(m: usize, n: usize) -> Self {
        // Create new EventRegulator
        EventRegulator {
            m: m,
            n: n,
            current_step: 0,
            current_event: 0,
        }
    }

    // Return pair (bool, bool) where first bool is true if event should be generated and second bool is true if step should be incremented
    pub fn event_step(&mut self) -> (bool, bool) {
        // Check if event should be generated
        let event = self.current_event < self.n;
        // Check if step should be incremented
        let step = self.current_step < self.m;
        // Increment current event
        self.current_event += 1;
        // Check if current event is greater than n
        if self.current_event > self.n {
            // Reset current event
            self.current_event = 1;
            // Increment current step
            self.current_step += 1;
        }
        // Return pair (event, step)
        (event, step)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Test generating 1 event during 1 step
    #[test]
    fn test_1_1() {
        // Create new EventRegulator
        let mut regulator = EventRegulator::new(1, 1);
        // Check if event should be generated
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (true, true));
    }

    // Test generating 2 events during 1 step
    #[test]
    fn test_1_2() {
        // Create new EventRegulator
        let mut regulator = EventRegulator::new(1, 2);
        // Check if event should be generated
        assert_eq!(regulator.event_step(), (true, false));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (true, false));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (true, false));
        assert_eq!(regulator.event_step(), (true, true));
    }

    // Test generating 1 event during 2 steps
    #[test]
    fn test_2_1() {
        // Create new EventRegulator
        let mut regulator = EventRegulator::new(2, 1);
        // Check if event should be generated
        assert_eq!(regulator.event_step(), (false, true));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (false, true));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (false, true));
        assert_eq!(regulator.event_step(), (true, true));
    }

    // Test evenly generating 5 events during 2 steps
    #[test]
    fn test_2_5() {
        // Create new EventRegulator
        let mut regulator = EventRegulator::new(2, 5);
        // Check if event should be generated
        assert_eq!(regulator.event_step(), (true, false));
        assert_eq!(regulator.event_step(), (true, false));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (true, false));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (true, false));
        assert_eq!(regulator.event_step(), (true, false));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (true, false));
        assert_eq!(regulator.event_step(), (true, true));
    }

    // Test evenly generating 5 events during 3 steps
    #[test]
    fn test_3_5() {
        // Create new EventRegulator
        let mut regulator = EventRegulator::new(3, 5);
        // Check if event should be generated
        assert_eq!(regulator.event_step(), (true, false));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (true, false));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (true, false));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (true, false));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (true, true));
    }

    // Test evenly generating 2 events during 5 steps
    #[test]
    fn test_5_2() {
        // Create new EventRegulator
        let mut regulator = EventRegulator::new(5, 2);
        // Check if event should be generated
        assert_eq!(regulator.event_step(), (false, true));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (false, true));
        assert_eq!(regulator.event_step(), (false, true));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (false, true));
        assert_eq!(regulator.event_step(), (true, true));
        assert_eq!(regulator.event_step(), (false, true));
        assert_eq!(regulator.event_step(), (false, true));
        assert_eq!(regulator.event_step(), (true, true));
    }
}
