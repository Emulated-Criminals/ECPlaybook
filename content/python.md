---
title: Python
date: 2024-01-20
background: bg-[#3776ab]
tags:
  - python
  - programming
  - scripting
categories:
  - Programming
intro: A Python quick reference guide covering basic syntax and common operations.
plugins:
  - copyCode
---

## Getting Started

### Hello World

```python
print("Hello, World!")
```

### Variables

```python
name = "John"
age = 30
pi = 3.14159
is_active = True
```

## Data Types

### Lists

```python
fruits = ["apple", "banana", "cherry"]
numbers = [1, 2, 3, 4, 5]

# Access items
first = fruits[0]

# Add items
fruits.append("orange")
```

### Dictionaries

```python
person = {
    "name": "John",
    "age": 30,
    "city": "New York"
}

print(person["name"])
```

## Control Flow

### If Statements

```python
x = 10

if x > 5:
    print("Greater than 5")
elif x < 5:
    print("Less than 5")
else:
    print("Equal to 5")
```

### For Loops {.row-span-2}

```python
# Loop through list
for fruit in fruits:
    print(fruit)

# Loop with range
for i in range(5):
    print(i)

# Loop with enumerate
for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")
```

```python
# List comprehension
squares = [x**2 for x in range(10)]
evens = [x for x in range(10) if x % 2 == 0]
```

List comprehensions provide a concise way to create lists.

## Functions

### Function Definition

```python
def greet(name):
    return f"Hello, {name}!"

print(greet("Alice"))
```

### Lambda Functions

```python
add = lambda x, y: x + y
square = lambda x: x ** 2

print(add(5, 3))  # 8
print(square(4))  # 16
```

Lambda functions are anonymous functions defined with the `lambda` keyword.
