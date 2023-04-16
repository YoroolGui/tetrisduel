use linked_hash_map::LinkedHashMap;
use std::sync::{Arc, RwLock};

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

    pub fn exists(&self, key: &K) -> bool {
        let items = self.items.read().unwrap();
        items.contains_key(key)
    }

    // get nubmer of items in storage
    pub fn len(&self) -> usize {
        let items = self.items.read().unwrap();
        items.len()
    }

    pub fn access<R>(&self, key: &K, access: impl FnOnce(Option<&V>) -> R) -> R {
        let items = self.items.read().unwrap();
        access(items.get(key))
    }

    pub fn access_refresh<R>(&self, key: &K, access: impl FnOnce(Option<&V>) -> R) -> R {
        let mut items = self.items.write().unwrap();
        // convert Option<&mut V> to Option<&V>
        let r = items.get_refresh(key);
        let r = r.map(|v| v as &V);
        access(r)
    }

    pub fn access_mut<R>(&self, key: &K, access: impl FnOnce(Option<&mut V>) -> R) -> R {
        let mut items = self.items.write().unwrap();
        access(items.get_mut(key))
    }

    pub fn access_refresh_mut<R>(&self, key: &K, access: impl FnOnce(Option<&mut V>) -> R) -> R {
        let mut items = self.items.write().unwrap();
        let r = items.get_refresh(key);
        access(r)
    }

    fn remove_lru(items: &mut LinkedHashMap<K, V>, capacity: usize) {
        if items.len() >= capacity {
            items.pop_front();
        }
    }

    // access to the item of underlying map by key with closure, create if not exists
    pub fn access_refresh_mut_with_create<R>(
        &self,
        key: &K,
        create: impl FnOnce() -> Option<V>,
        access: impl FnOnce(Option<&mut V>) -> R,
    ) -> R {
        let mut items = self.items.write().unwrap();
        if let Some(value) = items.get_refresh(key) {
            access(Some(value))
        } else {
            if let Some(mut value) = create() {
                let ret = access(Some(&mut value));
                Self::remove_lru(&mut items, self.capacity);
                items.insert(key.clone(), value);
                ret
            } else {
                access(None)
            }
        }
    }

    pub fn put(&self, key: K, value: V) {
        let mut items = self.items.write().unwrap();
        Self::remove_lru(&mut items, self.capacity);
        items.insert(key, value);
    }
}
