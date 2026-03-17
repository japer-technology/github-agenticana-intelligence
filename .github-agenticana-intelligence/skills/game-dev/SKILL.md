---
name: game-dev
description: Game loops, physics, rendering pipelines, engine patterns (Phaser, Unity, Godot), and multiplayer architecture.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Game Development

> Think in frames, not requests. Every millisecond of your game loop budget matters.

---

## 1. Game Loop Architecture

### The Core Loop

```
while (running) {
    processInput();     // Handle player input
    update(deltaTime);  // Update game state
    render();           // Draw the frame
}
```

### Fixed vs Variable Timestep

| Approach | Pros | Cons |
|----------|------|------|
| **Fixed timestep** | Deterministic physics, reproducible | Can spiral on slow hardware |
| **Variable timestep** | Adapts to hardware | Non-deterministic, physics instability |
| **Fixed + interpolation** | Best of both | More complex to implement |

### Frame Budget

| Target FPS | Budget per Frame |
|------------|-----------------|
| 30 | 33.3ms |
| 60 | 16.6ms |
| 120 | 8.3ms |

```
Budget allocation (60fps example):
├── Input:   ~1ms
├── Update:  ~5ms (physics, AI, logic)
├── Render:  ~8ms (draw calls, effects)
└── Margin:  ~2ms (headroom)
```

---

## 2. Entity-Component-System (ECS)

### Architecture

```
Entity    = ID (just a number)
Component = Data (Position, Velocity, Sprite, Health)
System    = Logic (MovementSystem, RenderSystem, CollisionSystem)
```

| Concept | Role |
|---------|------|
| **Entity** | Container / identifier |
| **Component** | Pure data, no behavior |
| **System** | Processes entities with matching components |

### Benefits

- Composition over inheritance
- Cache-friendly data layout
- Easy to add new behavior by combining components
- Systems can be enabled/disabled independently

---

## 3. Physics

### Collision Detection

| Phase | Purpose | Technique |
|-------|---------|-----------|
| **Broad phase** | Eliminate impossible collisions | Spatial hash, Quadtree, AABB sweep |
| **Narrow phase** | Precise collision testing | SAT, GJK, circle-circle |
| **Resolution** | Respond to collision | Impulse resolution, penetration correction |

### Common Physics Patterns

| Pattern | Application |
|---------|-------------|
| **AABB** | Fast axis-aligned bounding box checks |
| **Raycasting** | Line-of-sight, bullet paths |
| **Verlet integration** | Stable position-based physics |
| **Spatial partitioning** | Grid or quadtree for broad phase |

---

## 4. Rendering

### Render Pipeline

```
Scene Graph → Culling → Sorting → Batching → Draw Calls → Screen
```

### Optimization Techniques

| Technique | Impact |
|-----------|--------|
| **Sprite batching** | Reduce draw calls |
| **Texture atlases** | One texture for many sprites |
| **Object pooling** | Reuse objects, avoid GC |
| **Frustum culling** | Don't render off-screen objects |
| **Level of detail (LOD)** | Simpler models at distance |

### 2D Rendering Order

```
Background layer (z: 0)
├── Tilemap
├── Background decorations
Game layer (z: 1)
├── Entities sorted by y-position
├── Particles
UI layer (z: 2)
├── HUD
├── Menus
```

---

## 5. Engine-Specific Patterns

### Phaser (Web)

| Pattern | Usage |
|---------|-------|
| **Scene management** | Separate scenes for menu, gameplay, pause |
| **Arcade physics** | Simple AABB, good for most 2D games |
| **Matter.js** | Complex physics needs |
| **Asset preloading** | Load in a dedicated scene |

### Unity (C#)

| Pattern | Usage |
|---------|-------|
| **MonoBehaviour lifecycle** | Awake → Start → Update → FixedUpdate |
| **ScriptableObjects** | Data-driven design, shared config |
| **Object pooling** | Avoid Instantiate/Destroy in gameplay |
| **Coroutines / Async** | Time-delayed operations |

### Godot (GDScript)

| Pattern | Usage |
|---------|-------|
| **Scene tree** | Composition via node hierarchy |
| **Signals** | Decoupled event communication |
| **Area2D/3D** | Trigger zones, detection areas |
| **AnimationPlayer** | State-driven animations |

---

## 6. Multiplayer Architecture

### Network Models

| Model | Use Case |
|-------|----------|
| **Client-authoritative** | Simple, trust clients (casual games) |
| **Server-authoritative** | Competitive, cheat prevention |
| **Peer-to-peer** | Small player count, low latency |
| **Relay server** | P2P with NAT traversal |

### Netcode Patterns

| Pattern | Purpose |
|---------|---------|
| **Client-side prediction** | Responsive input, reconcile with server |
| **Server reconciliation** | Correct client state on mismatch |
| **Entity interpolation** | Smooth remote entity movement |
| **Lag compensation** | Server rewinds time for hit detection |

### Synchronization

```
Client → Input → Server → Simulate → State Snapshot → Clients
  ↓                                         ↓
Predict locally                    Interpolate/reconcile
```

---

## 7. Game Design Patterns

| Pattern | Application |
|---------|-------------|
| **State machine** | Character states (idle, running, jumping, attacking) |
| **Observer/Event** | Decoupled game events (score change, death, pickup) |
| **Object pool** | Bullets, particles, enemies — reuse, don't create/destroy |
| **Command pattern** | Input buffering, replay, undo |
| **Flyweight** | Shared data for many similar objects (tiles, bullets) |

---

## 8. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Allocate memory in the game loop | Pre-allocate and pool objects |
| Use deep inheritance hierarchies | Use composition (ECS) |
| Process off-screen entities | Cull inactive entities |
| Hard-code game values | Use data-driven configuration |
| Skip frame-rate independence | Always use deltaTime |
| Trust the client in multiplayer | Server-authoritative for competitive |
| Render everything every frame | Only re-render what changed |
| Ignore garbage collection | Pool objects to minimize GC pauses |

---

> **Remember:** Games are real-time systems. Every frame counts. Profile constantly, pool aggressively, and always think about what's happening in 16.6ms.
