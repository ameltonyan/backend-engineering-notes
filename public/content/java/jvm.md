# JVM Internals

## Heap vs Stack vs Metaspace

### Interview Answer

Heap stores objects and arrays and is shared among all threads.

Stack stores method frames, local variables, and references and is private to each thread.

Metaspace stores class metadata and resides in native memory outside the heap.

## Heap

Stores:

* Objects
* Arrays

Managed by the garbage collector.

Shared between all threads.

## Stack

Stores:

* Method calls
* Local variables
* References

Each thread has its own stack.

Follows LIFO behavior.

### Why are local variables thread-safe?

Each thread owns its own stack.

Local variables are not shared between threads.

## Metaspace

Stores:

* Class definitions
* Methods
* Fields
* Annotations
* Bytecode metadata

### Is Metaspace part of the heap?

No.

Metaspace uses native memory outside the Java heap.

### What existed before Metaspace?

PermGen.

Java 8 replaced PermGen with Metaspace.

## String Pool

### Interview Answer

The String Pool is a special memory area used to store String literals.

If a String already exists in the pool, the JVM reuses it instead of creating a new object.

### Where is String Pool stored?

In modern Java versions, the String Pool resides inside the heap.

### Why is String immutable?

* Thread safety
* String pooling
* Hashcode caching
* Security

## Full GC

### Interview Answer

Full GC performs garbage collection across the entire heap.

Application threads are paused during the operation.

Frequent Full GC events usually indicate memory pressure or memory leaks.

### What is Stop-The-World?

Application threads are temporarily paused while garbage collection is performed.

## ClassLoader

### Interview Answer

ClassLoaders load classes into memory at runtime.

Main ClassLoaders:

* Bootstrap ClassLoader
* Platform ClassLoader
* Application ClassLoader

### Parent Delegation Model

A child class loader asks its parent to load a class first.

This prevents duplicate loading and improves security.

### What loads java.lang.String?

Bootstrap ClassLoader.
