# tSol

A transpiler to solidity that adds GCC macros and helper functions. This tool was build to assist in the developement Decentralized Clearing Network by [merkleX](https://merklex.io).

## High Level Assembly Functions

### pointer

Gives the storage address for an item in an array.

**Usage**

```
pragma solidity 0.5.7;

#define TRANSPILE

contract Ex {
  struct Item {
    uint64[8] numbers;
  }

  Item[1024] items;

  function foo() public {
    assembly {
      // let item_ptr := add(items_slot, mul(2, 10))
      let item_ptr := pointer(Item, items_slot, 10)
    }
  }
}
```
