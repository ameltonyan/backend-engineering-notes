# Java Core

## HashMap vs ConcurrentHashMap

### Answer

HashMap is a non-thread-safe key-value structure.

ConcurrentHashMap is thread-safe and uses fine-grained synchronization and CAS operations.

Hashtable is a legacy synchronized implementation.

---

### Follow-up

#### What is CAS?

Compare-And-Set is an atomic CPU operation used for lock-free concurrency.