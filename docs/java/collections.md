# Collections

## HashMap vs ConcurrentHashMap vs Hashtable

### Interview Answer

HashMap is a non-thread-safe key-value data structure that provides O(1) average lookup performance using hashing.

ConcurrentHashMap is a thread-safe implementation designed for concurrent access. It uses fine-grained synchronization and CAS operations, allowing multiple threads to work efficiently.

Hashtable is a legacy synchronized implementation that locks most operations using a single monitor, resulting in lower scalability.

### Follow-up: How does ConcurrentHashMap achieve thread safety?

ConcurrentHashMap avoids locking the entire map.

It synchronizes only small portions of the internal structure when required and uses CAS operations for simple updates.

This allows multiple threads to update different buckets simultaneously.

### Follow-up: What is CAS?

CAS stands for Compare-And-Set.

It is a hardware-supported atomic operation provided by the CPU.

Process:

1. Compare current value with expected value.
2. If equal, update the value.
3. Otherwise fail and retry.

AtomicInteger and ConcurrentHashMap use CAS internally.

### Follow-up: What is a hash collision?

A hash collision occurs when multiple keys map to the same bucket.

HashMap stores multiple entries within that bucket and uses equals() to locate the correct entry.

### Follow-up: Why is Hashtable slower?

Hashtable synchronizes most operations on a single lock.

This forces threads to wait even when accessing unrelated entries.

ConcurrentHashMap provides much better scalability.

---

## equals() vs hashCode()

### Interview Answer

equals() defines logical equality.

hashCode() determines the bucket location used by hash-based collections.

Whenever equals() is overridden, hashCode() must also be overridden.

### Why?

HashMap first uses hashCode() to find a bucket and then uses equals() to find the matching object.

Failing to override both methods can cause lookup failures.

### Example

Two objects may be logically equal:

```java
user1.equals(user2) == true
```

but produce different hash codes, preventing HashMap from locating them correctly.
