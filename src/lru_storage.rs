use std::sync::{Arc, RwLock};

use linked_hash_map::LinkedHashMap;
use rocket::serde::json::serde_json::map::Iter;

pub struct LRUStorage<K: Eq + std::hash::Hash + Clone, V> {
    items: Arc<RwLock<LinkedHashMap<K, V>>>,
    capacity: usize,
}

// Implement new function for UserMemStorage
impl<K: Eq + std::hash::Hash + Clone, V> LRUStorage<K, V> {
    pub fn new(capacity: usize) -> Self {
        Self {
            items: Arc::new(RwLock::new(LinkedHashMap::new())),
            capacity,
        }
    }

    // get nubmer of items in storage
    pub fn len(&self) -> usize {
        let items = self.items.read().unwrap();
        items.len()
    }

    // access to the item of underlying map by key with closure
    pub fn access_with_create(
        &self,
        key: &K,
        create: impl FnOnce() -> Option<V>,
        access: impl FnOnce(&V),
    ) {
        let mut items = self.items.write().unwrap();
        if let Some(value) = items.get_refresh(key) {
            access(value);
        } else {
            if let Some(value) = create() {
                if items.len() >= self.capacity {
                    items.pop_front();
                }
                access(&value);
                items.insert(key.clone(), value);
            }
        }
    }

    pub fn put(&mut self, key: K, value: V) {
        let mut items = self.items.write().unwrap();
        if items.len() >= self.capacity {
            items.pop_front();
        }
        items.insert(key, value);
    }
}
