use async_std::sync::RwLock;
use linked_hash_map::LinkedHashMap;

pub struct LRUStorage<K: Eq + std::hash::Hash + Clone, V> {
    items: RwLock<LinkedHashMap<K, V>>,
    capacity: usize,
}

// Implement new function for UserMemStorage
impl<K: Eq + std::hash::Hash + Clone, V> LRUStorage<K, V> {
    pub fn new(capacity: usize) -> Self {
        Self {
            items: RwLock::new(LinkedHashMap::new()),
            capacity,
        }
    }

    // access to the item of underlying map by key with closure
    pub async fn access(&self, key: &K, f: impl FnOnce(&mut V)) {
        let mut items = self.items.write().await;
        if let Some(value) = items.get_refresh(key) {
            f(value);
        }
    }
    pub async fn put(&mut self, key: K, value: V) {
        let mut items = self.items.write().await;
        if items.len() >= self.capacity {
            items.pop_front();
        }
        items.insert(key, value);
    }
}
