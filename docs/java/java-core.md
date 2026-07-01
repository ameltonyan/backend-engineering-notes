# Java Core Interview Notes
## Day 01 — JVM & Memory

### Topics

- JVM Architecture
- Stack vs Heap
- Metaspace
- Stack Frames
- Class Loading
- Java Memory Model

---

## 1. JVM Architecture

### Interview Question

**Explain the JVM architecture and what happens when a Java application starts.**

### Senior Answer

Java source code is compiled by the Java compiler (`javac`) into platform-independent bytecode (`.class` files). When the application starts, the JVM loads the required classes using the Class Loader subsystem.

The JVM allocates memory across several runtime data areas, including the Heap, Stack, Metaspace, Program Counter Register, and Native Method Stack.

The Execution Engine initially interprets the bytecode. Frequently executed ("hot") methods are then compiled into native machine code by the Just-In-Time (JIT) compiler for better performance.

Memory management is handled automatically by the Garbage Collector, which removes objects that are no longer reachable.

### Follow-up Questions

- What is bytecode?
- Why is Java platform independent?
- What is JIT?
- What is a hot method?
- What is the difference between Interpreter and JIT?

### Common Mistakes

❌ Saying the JVM executes Java source code.

✅ The JVM executes bytecode.

---

## 2. Stack vs Heap

### Interview Question

**What is the difference between Stack and Heap memory?**

### Senior Answer

The Stack is thread-local memory used to store method stack frames, local variables, primitive values, and object references. Memory is allocated and released automatically when methods are invoked and return.

The Heap is shared across all threads and stores objects and arrays. Objects remain in memory until they become unreachable, after which the Garbage Collector can reclaim them.

Stack allocation is faster because it follows a Last-In-First-Out (LIFO) structure, while heap allocation requires memory management by the JVM.

### Follow-up Questions

- Where are objects stored?
- Where are references stored?
- Can the Heap cause StackOverflowError?
- Can the Stack cause OutOfMemoryError?
- Why is Stack faster?

### Common Mistakes

❌ Objects are stored on the Stack.

✅ Object references are on the Stack; objects themselves are on the Heap.

---

## 3. Metaspace

### Interview Question

**What is Metaspace?**

### Senior Answer

Metaspace is the JVM memory area that stores class metadata, including class definitions, method metadata, field information, annotations, and runtime constant pools.

Starting with Java 8, Metaspace replaced the Permanent Generation (PermGen). Unlike PermGen, Metaspace uses native memory instead of the Java Heap, making it more flexible and reducing OutOfMemoryErrors caused by fixed-size metadata storage.

### Follow-up Questions

- What replaced PermGen?
- Does Metaspace store objects?
- Can Metaspace run out of memory?

### Common Mistakes

❌ Metaspace stores Java objects.

✅ It stores class metadata, not application objects.

---

## 4. Stack Frames

### Interview Question

**What is a Stack Frame?**

### Senior Answer

Every method invocation creates a new Stack Frame on the current thread's stack.

A Stack Frame contains:

- Local variables
- Operand stack
- Return address
- Method execution information

When the method completes, its Stack Frame is removed from the stack automatically.

Each thread has its own independent Stack, which is why local variables are thread-safe by default.

### Follow-up Questions

- What is stored inside a Stack Frame?
- Why does recursion cause StackOverflowError?
- Does each thread have its own Stack?

### Common Mistakes

❌ Stack Frames are shared between threads.

✅ Each thread owns its own Stack and Stack Frames.

---

## 5. Class Loading

### Interview Question

**Explain the Java Class Loading process.**

### Senior Answer

Class loading consists of three main phases:

1. Loading – The Class Loader locates the `.class` file and loads it into memory.
2. Linking – The JVM verifies the bytecode, prepares static fields, and resolves symbolic references.
3. Initialization – Static variables and static initialization blocks are executed.

Java uses a parent delegation model where class loaders delegate loading to their parent before attempting to load the class themselves. This prevents duplicate loading and improves security.

### Follow-up Questions

- What is the Bootstrap ClassLoader?
- What is Parent Delegation?
- Why is Parent Delegation important?

### Common Mistakes

❌ Classes are initialized immediately after compilation.

✅ Classes are initialized when first actively used.

---

## 6. Java Memory Model (JMM)

### Interview Question

**What is the Java Memory Model?**

### Senior Answer

The Java Memory Model defines how threads interact through memory and guarantees visibility, ordering, and atomicity of shared variables.

It specifies when changes made by one thread become visible to other threads and defines the happens-before relationship.

Synchronization mechanisms such as `synchronized`, `volatile`, locks, and atomic classes rely on the Java Memory Model to ensure thread safety.

### Follow-up Questions

- What is happens-before?
- What does `volatile` guarantee?
- Does `volatile` make operations atomic?
- What visibility guarantees exist?

### Common Mistakes

❌ `volatile` makes every operation thread-safe.

✅ `volatile` guarantees visibility and ordering, but not atomicity.

---

## Quick Revision

| Topic | Key Takeaway |
|---------|--------------|
| JVM | Executes bytecode using Interpreter and JIT |
| Stack | Thread-local, stores Stack Frames |
| Heap | Shared memory for objects |
| Metaspace | Stores class metadata |
| Stack Frame | Created for every method call |
| Class Loading | Loading → Linking → Initialization |
| JMM | Defines visibility, ordering and atomicity rules |

---

## Homework

Be able to answer every question above without reading the notes.

Target answer length:

- JVM Architecture → 2 minutes
- Stack vs Heap → 2 minutes
- Metaspace → 1 minute
- Stack Frames → 1 minute
- Class Loading → 2 minutes
- Java Memory Model → 2 minutes