# Java Core and Concurrency

## 1. HashMap vs ConcurrentHashMap vs Hashtable

## Question

What is the difference between HashMap, ConcurrentHashMap, and Hashtable?

## Answer

HashMap is a non-thread-safe implementation of the Map interface that stores data as key-value pairs. Internally it uses hashing to distribute entries across buckets, which allows O(1) average lookup performance.

ConcurrentHashMap is a thread-safe implementation designed for highly concurrent environments. Unlike Hashtable, it does not lock the entire map for every operation. Modern implementations use a combination of CAS operations and fine-grained synchronization, allowing multiple threads to read and update the map concurrently with much better scalability.

Hashtable is a legacy thread-safe implementation. Most operations synchronize on the entire map, meaning only one thread can effectively modify or access protected operations at a time. Because of this, it typically performs worse than ConcurrentHashMap under contention.

In modern applications, ConcurrentHashMap is generally preferred over Hashtable when thread safety is required.

## Internal Implementation

### HashMap

When inserting a value:

```java
map.put("John", 100);
```

HashMap:

1. Calculates the key's hashcode.
2. Maps the hashcode to a bucket.
3. Stores the entry in that bucket.

When retrieving:

```java
map.get("John");
```

the same hash calculation is performed, allowing the map to jump directly to the correct bucket.

This is why average lookup complexity is O(1).

### Hash Collisions

Multiple keys may end up in the same bucket.

Before Java 8, collisions were stored as linked lists.

Since Java 8, large collision chains can be converted into balanced trees, improving worst-case lookup performance.

### ConcurrentHashMap

ConcurrentHashMap improves concurrency by:

* Using CAS operations for many updates.
* Applying synchronization only where necessary.
* Allowing mostly lock-free reads.

This significantly reduces contention compared to Hashtable.

### Hashtable

Hashtable synchronizes most operations using a single monitor.

Effectively:

```java
public synchronized V get(...)
```

```java
public synchronized V put(...)
```

Every operation competes for the same lock.

## Follow-Up Questions

### Is HashMap always O(1)?

No.

Average complexity is O(1), but excessive hash collisions can degrade performance.

Before Java 8, worst-case complexity could become O(n).

Since Java 8, treeified buckets improve worst-case complexity to O(log n).

### Why is ConcurrentHashMap faster than Hashtable?

Hashtable uses a single lock for most operations.

ConcurrentHashMap allows multiple threads to access different regions of the map concurrently, significantly reducing lock contention.

### Can HashMap be used safely by multiple threads?

Not without external synchronization.

Concurrent modifications can cause:

* Lost updates
* Inconsistent reads
* Internal structure corruption

For concurrent access, ConcurrentHashMap should be used.

## Key Points to Remember

* HashMap → Fast, non-thread-safe.
* ConcurrentHashMap → Thread-safe, scalable, modern choice.
* Hashtable → Thread-safe, legacy implementation, generally avoided.
* HashMap uses buckets and hashing.
* ConcurrentHashMap uses CAS and fine-grained synchronization.
* Hashtable synchronizes the entire map.

---

## 2. What happens when executing `String s = "hello";`?

When the JVM encounters the string literal `"hello"`, it first checks the String Pool.

* If the string already exists, the existing instance is reused.
* Otherwise, a new String object is created in the String Pool.

The variable `s` stores a reference to that pooled String.

### Why Strings Are Immutable

String immutability provides:

* Thread safety
* String Pooling
* Hashcode caching
* Security

Example:

```java
String a = "hello";
String b = "hello";
```

Both variables reference the same String object.

---

## 3. Explain Heap, Stack, and Metaspace

### Heap

The heap stores:

* Objects
* Arrays

Characteristics:

* Shared among all threads
* Managed by the garbage collector
* Configurable using `-Xms` and `-Xmx`

---

### Stack

Each thread has its own stack.

The stack stores:

* Method frames
* Local variables
* Object references

Characteristics:

* One stack per thread
* LIFO (Last-In-First-Out)

---

### Metaspace

Metaspace stores class metadata such as:

* Class definitions
* Methods
* Fields
* Annotations
* Inheritance information

Characteristics:

* Stored in native memory
* Outside the heap
* Replaced PermGen in Java 8

---

## 4. What is the difference between `==` and `equals()`?

### `==`

Compares:

* Primitive values
* Object references

Example:

```java
String a = new String("abc");
String b = new String("abc");

System.out.println(a == b);
```

Output:

```text
false
```

---

### `equals()`

Compares logical equality.

Example:

```java
System.out.println(a.equals(b));
```

Output:

```text
true
```

### Important Rule

Whenever `equals()` is overridden, `hashCode()` must also be overridden.

---

## 5. What is a memory leak in Java?

A memory leak occurs when objects are no longer needed but remain reachable from GC roots.

### Common Causes

* Static collections
* Caches without eviction
* ThreadLocal misuse
* Unremoved listeners
* Long-lived references

### Key Point

Garbage Collection cannot remove objects that are still reachable.

---

## 6. Explain `volatile`, `synchronized`, and `AtomicInteger`

### volatile

Provides:

* Visibility guarantees
* Ordering guarantees

Does not provide:

* Atomicity

Example:

```java
volatile int counter;
counter++;
```

The increment operation is still not thread-safe.

---

### synchronized

Provides:

* Mutual exclusion
* Visibility guarantees
* Atomic execution of critical sections

Example:

```java
synchronized(lock) {
    counter++;
}
```

---

### AtomicInteger

Provides lock-free thread-safe operations using CAS (Compare-And-Set).

Example:

```java
AtomicInteger counter = new AtomicInteger();

counter.incrementAndGet();
```

---

### What is CAS?

CAS stands for Compare-And-Set.

Conceptually:

```text
IF currentValue == expectedValue
    update value
ELSE
    fail
```

CAS is implemented using CPU-level atomic instructions such as:

```text
CMPXCHG
```

on x86 processors.

---

## 7. What happens during a Full GC?

A Full GC performs garbage collection across the entire heap.

Typically includes:

* Young Generation
* Old Generation

Characteristics:

* Stop-The-World pause
* Application threads are paused
* Memory is reclaimed

Frequent Full GCs may indicate:

* Memory leaks
* Insufficient heap size
* Poor JVM tuning

---

## 8. What is a ClassLoader?

A ClassLoader loads classes into JVM memory at runtime.

### Bootstrap ClassLoader

Loads core Java classes:

```java
java.lang.String
java.util.List
```

---

### Platform ClassLoader

Loads JDK platform libraries.

---

### Application ClassLoader

Loads application classes from the classpath.

---

### Parent Delegation Model

Class loading follows this order:

```text
Application
    ↓
Platform
    ↓
Bootstrap
```

Benefits:

* Security
* Prevents duplicate class loading

---

## 9. What happens when multiple threads modify the same HashMap?

HashMap is not thread-safe.

Possible issues:

* Lost updates
* Inconsistent reads
* Corrupted internal state
* Resize-related problems

### Concurrent Resize Problem

When a HashMap grows, it resizes and rehashes entries.

Concurrent modifications during resize can corrupt internal structures.

For concurrent access, use:

```java
ConcurrentHashMap
```

---

## 10. Explain optimistic and pessimistic locking

### Optimistic Locking

Assumes conflicts are rare.

Typically implemented using:

```java
@Version
private Long version;
```

Update process:

1. Read current version
2. Attempt update
3. Verify version before commit

If the version changed:

```text
OptimisticLockException
```

is thrown.

#### Advantages

* Better scalability
* No database lock held

#### Disadvantages

* Updates may need retries

---

### Pessimistic Locking

Assumes conflicts are likely.

Database rows are locked immediately.

Example:

```sql
SELECT *
FROM account
FOR UPDATE;
```

#### Advantages

* Prevents concurrent updates

#### Disadvantages

* Lower throughput
* Potential deadlocks
* Longer lock durations

---

## 11. Explain ExecutorService, ForkJoinPool, and CompletableFuture

### ExecutorService

Manages and executes tasks using a pool of reusable threads.

Example:

```java
ExecutorService executor =
        Executors.newFixedThreadPool(10);

executor.submit(() -> processPayment());
```

Benefits:

* Thread reuse
* Resource management
* Better scalability

---

### ForkJoinPool

Designed for recursive divide-and-conquer workloads.

Process:

1. Split large task (Fork)
2. Execute subtasks in parallel
3. Combine results (Join)

Example:

```java
parallelStream()
```

often uses ForkJoinPool internally.

---

### Work Stealing

Each worker thread has its own task queue.

If a worker becomes idle:

```text
Worker-1 queue -> empty
Worker-2 queue -> many tasks
```

Worker-1 can steal tasks from Worker-2.

Benefits:

* Better CPU utilization
* Improved load balancing

---

### CompletableFuture

Represents an asynchronous computation.

Example:

```java
CompletableFuture<User> future =
    CompletableFuture.supplyAsync(
        () -> userService.getUser()
    );
```

Supports chaining:

```java
future.thenApply(...)
      .thenAccept(...)
      .exceptionally(...);
```

Allows asynchronous workflows without blocking.

---

### Relationship

* ExecutorService executes tasks.
* ForkJoinPool is a specialized ExecutorService.
* CompletableFuture represents asynchronous computations and typically uses ExecutorService or ForkJoinPool underneath.

---

## 12. What is a deadlock?

A deadlock occurs when two or more threads permanently wait for resources held by each other.

Example:

Thread A:

```text
Holds Lock A
Waiting for Lock B
```

Thread B:

```text
Holds Lock B
Waiting for Lock A
```

Neither thread can continue.

---

### Detection

Common tools:

```bash
jstack <pid>
```

* VisualVM
* Java Mission Control
* Thread Dumps

---

### Prevention

* Consistent lock ordering
* Reduced nested locking
* tryLock()
* Lock acquisition timeouts

---

## 13. What is the difference between synchronized and ReentrantLock?

### synchronized

Example:

```java
synchronized(lock) {
    // critical section
}
```

#### Advantages

* Simple
* Automatic unlock
* Less error-prone

#### Disadvantages

* Less flexible

---

### ReentrantLock

Example:

```java
lock.lock();

try {
    // critical section
}
finally {
    lock.unlock();
}
```

#### Advantages

Timed lock acquisition:

```java
lock.tryLock();
```

Interruptible locking:

```java
lock.lockInterruptibly();
```

Fairness:

```java
new ReentrantLock(true);
```

Multiple Conditions:

```java
Condition notEmpty;
Condition notFull;
```

#### Disadvantages

* Must manually unlock
* Easier to introduce bugs

---

### Condition Objects

Condition objects create separate wait queues.

Example:

* Producers wait on `notFull`
* Consumers wait on `notEmpty`

This avoids waking unrelated threads and improves efficiency.

---

## 14. How would you implement a thread-safe counter?

### Using synchronized

```java
public class Counter {

    private int counter;

    public synchronized int increment() {
        return ++counter;
    }
}
```

---

### Using AtomicInteger

```java
public class Counter {

    private final AtomicInteger counter =
            new AtomicInteger();

    public int increment() {
        return counter.incrementAndGet();
    }
}
```

---

### High Throughput Systems

Preferred:

```java
AtomicInteger
```

because it avoids lock contention.

For extremely high contention:

```java
LongAdder
```

often provides better performance than AtomicInteger.
