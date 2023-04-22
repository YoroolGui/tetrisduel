use std::collections::{HashMap, HashSet};
use std::hash::Hash;

//
// Stores pairs of players and play fields for each pair
//
pub struct Match<K, V> {
    player_a: K,
    player_b: K,
    field: V,
}

pub trait WaitList<K> {
    fn add(&mut self, player: K);
    fn remove(&mut self, player: &K);
    fn find_matching_pair(&self, player: &K) -> Option<&K>;
}

impl<K: PartialEq + Eq + Hash> WaitList<K> for HashSet<K> {
    fn add(&mut self, player: K) {
        self.insert(player);
    }
    fn remove(&mut self, player: &K) {
        self.remove(player);
    }
    fn find_matching_pair(&self, player: &K) -> Option<&K> {
        // Get first key from wait list not equal to player
        self.iter().find(|k| k != &player)
    }
}

type MatchId = usize;

pub struct MatchFinder<K: Copy + Eq + Hash, WL: WaitList<K>, V: Default> {
    wait_list: WL,
    match_ids: HashMap<K, MatchId>,
    matches: HashMap<MatchId, Match<K, V>>,
}

impl<K: Copy + Eq + Hash, WL: WaitList<K>, V: Default> MatchFinder<K, WL, V> {
    pub fn new(wait_list: WL) -> MatchFinder<K, WL, V> {
        MatchFinder {
            wait_list,
            match_ids: HashMap::new(),
            matches: HashMap::new(),
        }
    }
    pub fn find_match(&mut self, player_a: &K) -> Option<MatchId> {
        // Check if player is already match ids, just return the match id
        if let Some(match_id) = self.match_ids.get(player_a) {
            Some(*match_id)
        } else if let Some(player_b) = self.wait_list.find_matching_pair(player_a) {
            // Matching player found, create a new match
            let match_id = self.matches.len();
            self.matches.insert(
                match_id,
                Match {
                    player_a: *player_a,
                    player_b: *player_b,
                    field: V::default(),
                },
            );
            self.match_ids.insert(*player_a, match_id);
            self.match_ids.insert(*player_b, match_id);
            Some(match_id)
        } else {
            // Matching player not found, add to wait list
            self.wait_list.add(*player_a);
            None
        }
    }
    pub fn remove_match(&mut self, match_id: MatchId) {
        if let Some(match_) = self.matches.remove(&match_id) {
            self.match_ids.remove(&match_.player_a);
            self.match_ids.remove(&match_.player_b);
        }
    }
    pub fn get_match(&self, match_id: MatchId) -> Option<&Match<K, V>> {
        self.matches.get(&match_id)
    }
}
