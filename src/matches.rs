use std::collections::{HashMap, HashSet};
use std::hash::Hash;

//
// Stores pairs of players and play fields for each pair
//
pub struct Match<K: Eq, V> {
    pub player_a: K,
    pub player_b: K,
    pub field: V,
}

#[derive(Debug, PartialEq, Eq, Hash, Copy, Clone)]
pub enum PlayerSide {
    A,
    B,
}

impl<K: Eq, V> Match<K, V> {
    pub fn new(player_a: K, player_b: K, field: V) -> Match<K, V> {
        Match {
            player_a,
            player_b,
            field,
        }
    }
    pub fn get_player(&self, side: PlayerSide) -> &K {
        match side {
            PlayerSide::A => &self.player_a,
            PlayerSide::B => &self.player_b,
        }
    }
    pub fn get_player_side(&self, player: &K) -> Option<PlayerSide> {
        if player == &self.player_a {
            Some(PlayerSide::A)
        } else if player == &self.player_b {
            Some(PlayerSide::B)
        } else {
            None
        }
    }
}

pub trait WaitList<K> {
    fn add(&mut self, player: K);
    fn remove(&mut self, player: &K);
    fn exists(&self, player: &K) -> bool;
    fn find_matching_pair(&self, player: &K) -> Option<&K>;
}

impl<K: PartialEq + Eq + Hash> WaitList<K> for HashSet<K> {
    fn add(&mut self, player: K) {
        self.insert(player);
    }
    fn remove(&mut self, player: &K) {
        self.remove(player);
    }
    fn exists(&self, player: &K) -> bool {
        self.contains(player)
    }
    fn find_matching_pair(&self, player: &K) -> Option<&K> {
        // Get first key from wait list not equal to player
        self.iter().find(|k| k != &player)
    }
}

pub type MatchId = usize;

pub struct Matches<K, V, WL = HashSet<K>>
where
    K: Copy + Eq + Hash,
    WL: WaitList<K> + Default,
    V: Default,
{
    wait_list: WL,
    match_ids: HashMap<K, MatchId>,
    matches: HashMap<MatchId, Match<K, V>>,
}

#[derive(Debug, PartialEq, Eq)]
pub enum PlayerStatus {
    Match,
    WaitList,
    NotFound,
}

impl<K, WL, V> Matches<K, V, WL>
where
    K: Copy + Eq + Hash,
    WL: WaitList<K> + Default,
    V: Default,
{
    pub fn new() -> Matches<K, V, WL> {
        Matches {
            wait_list: WL::default(),
            match_ids: HashMap::new(),
            matches: HashMap::new(),
        }
    }

    pub fn get_player_status(&self, player: &K) -> PlayerStatus {
        if self.match_ids.contains_key(player) {
            PlayerStatus::Match
        } else if self.wait_list.exists(player) {
            PlayerStatus::WaitList
        } else {
            PlayerStatus::NotFound
        }
    }

    pub fn find_match(&mut self, player: &K) -> bool {
        // Check if player is already in match
        if let Some(_) = self.match_ids.get(player) {
            true
        } else if let Some(player_b) = self.wait_list.find_matching_pair(player) {
            // Matching player found, create a new match
            let match_id = self.matches.len();
            self.matches.insert(
                match_id,
                Match {
                    player_a: *player,
                    player_b: *player_b,
                    field: V::default(),
                },
            );
            self.match_ids.insert(*player, match_id);
            self.match_ids.insert(*player_b, match_id);
            true
        } else {
            // Matching player not found, add to wait list
            self.wait_list.add(*player);
            false
        }
    }
    pub fn remove_match(&mut self, match_id: MatchId) {
        if let Some(match_) = self.matches.remove(&match_id) {
            self.match_ids.remove(&match_.player_a);
            self.match_ids.remove(&match_.player_b);
        }
    }
    pub fn get_match(&self, match_id: &MatchId) -> Option<&Match<K, V>> {
        self.matches.get(match_id)
    }
    pub fn get_match_for_player(&self, player: &K) -> Option<(MatchId, &Match<K, V>)> {
        if let Some(match_id) = self.match_ids.get(player) {
            self.matches.get(match_id).map(|m| (*match_id, m))
        } else {
            None
        }
    }

    pub fn get_mut_match_for_player(&mut self, player: &K) -> Option<(MatchId, &mut Match<K, V>)> {
        if let Some(match_id) = self.match_ids.get(player) {
            self.matches.get_mut(match_id).map(|m| (*match_id, m))
        } else {
            None
        }
    }
}
