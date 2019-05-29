# tSol

A transpiler to Solidity that adds GCC macros and helper functions. 

**Why does this exist?**

Solidity codes runs on the Etheruem Virtual Machine, an environment where every operation has a fixed cost. To keep processing costs low, it often makes sense to use Solidity Assembly to manually optimize storage (memory) operations. This transpiler provides tooling and language features to make Solidity Assembly more managable. This tool was build to assist in the developement Decentralized Clearing Network by [merkleX](https://merklex.io).

### Runtime Requirements

 - gcc
 - npm & node

## Added Assembly Functions

### pointer(type, array\_start\_pointer, index)

Gives the storage address for an item in an array.

```c
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

### pointer\_attr(type, object\_pointer, attribute\_name)

Gives the storage address for an object's attribute.

```c
pragma solidity 0.5.7;

#define TRANSPILE

contract Ex {
  struct Item {
    uint64[8] numbers;
    uint64 a;
    uint64 b;
    uint64 c;
    uint64 d;
    uint256 e;
  }

  Item[1024] items;

  function foo() public {
    assembly {
      // let item_ptr := add(items_slot, mul(4, 10))
      let item_ptr := pointer(Item, items_slot, 10)
      // let e_ptr := add(item_ptr, 3)
      let e_ptr := pointer_attr(Item, item_ptr, e)

      let e := sload(e_ptr)
      sstore(e_ptr, add(e, 1))
    }
  }
}
```

### byte\_offset(type, attribute\_name)

Byte offset of a attribute inside of a type.

```c
pragma solidity 0.5.7;

#define TRANSPILE

contract Ex {
  struct Item {
    uint64[8] numbers;
    uint64 a;
    uint64 b;
    uint64 c;
    uint64 d;
    uint256 e;
  }

  uint64 foo;

  function foo(bytes memory input) public {
    assembly {
      // let b_offset := 72
      let b_offset := byte_offset(Item, b)
      let b := mload(add(add(input, 32), b_offset))

      sstore(foo_slot, b)
    }
  }
}
```

### build(type, word, attributes...) | build\_with\_mask(type, word, attributes...)

Packs the data of an object. build\_with\_mask will mask each attribute to ensure attributes are not corrupted if the attribute is larger than allowed size.

```c
pragma solidity 0.5.7;

#define TRANSPILE

contract Ex {
  struct Item {
    uint64 a;
    uint64 b;
    uint64 c;
    uint64 d;
    uint128 e;
    uint128 f;
  }

  Item item;

  function foo() public {
    assembly {
      // let data_0 := or(or(or(
      //   /* a */ mul(1, 0x1000000000000000000000000000000000000000000000000),
      //   /* b */ mul(2, 0x100000000000000000000000000000000)),
      //   /* c */ mul(3, 0x10000000000000000)),
      //   /* d */ 4)

      let data_0 := build(Item, 0,
        /* a */ 1,
        /* b */ 2,
        /* c */ 3,
        /* d */ 4
      )

      // let data_1 := or(
      //     /* e */ mul(5, 0x100000000000000000000000000000000),
      //     /* f */ 6)

      let data_1 := build(Item, 1,
        /* e */ 5,
        /* f */ 6
      )

      sstore(item_slot, data_0)
      sstore(add(item_slot, 1), data_1)
    }
  }
}
```

### attr(type, word, object_data, attribute\_name)

Extracts an attribute from an object.

```c
pragma solidity 0.5.7;

#define TRANSPILE

contract Ex {
  struct Item {
    uint64 a;
    uint64 b;
    uint64 c;
    uint64 d;
    uint128 e;
    uint128 f;
  }

  Item item;

  function foo() public {
    assembly {
      let item_data_0 := sload(item_slot)
      let item_data_1 := sload(add(item_slot, 1))

      // let b := and(div(item_data_0, 0x100000000000000000000000000000000), 0xffffffffffffffff)
      let b := attr(Item, 0, item_data_0, b)
      // let f := and(item_data_1, 0xffffffffffffffffffffffffffffffff)
      let f := attr(Item, 1, item_data_1, f)
    }
  }
}
```

### fn\_hash(fn\_signature)

Hashes a function signture for Solidity's calling semantics.

```c
pragma solidity 0.5.7;

#define TRANSPILE

contract Ex {
  function foo() public {
    assembly {
     // let function_hash := /* fn_hash("transfer(address,uint256)") */ 0xa9059cbb00000000000000000000000000000000000000000000000000000000
      let function_hash := fn_hash("transfer(address,uint256)")
      // ...
    }
  }
}
```

### log\_event(event\_type, memory\_pointer, arguments...)

Logs an event

```c
pragma solidity 0.5.7;

#define TRANSPILE

contract Ex {
  event UserCreated(uint64 user_id);

  function foo() public {
    uint256[2] memory log_data_mem;

    assembly {
      let user_id := 5

      // /* Log event: UserCreated */
      // mstore(log_data_mem, user_id)
      // log1(log_data_mem, 32, /* UserCreated */ 0x654a5f371dd267582fdba132709448f256a549360e2ce54ccb3699d3b8ed2394)
      log_event(UserCreated, log_data_mem, user_id)
    }
  }
}
```
