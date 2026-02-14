# Timer Implementation Guide

## Recommended Pattern for Cooldown Timers

Based on the documentation examples, here's the recommended approach for implementing spell cooldown timers:

## Core Timer Pattern

```typescript
@action({ UUID: "com.dt.spellcooldowns2.cooldown" })
export class CooldownTimer extends SingletonAction<CooldownSettings> {
    // Store timers per action instance
    private timers = new Map<string, NodeJS.Timeout>();
    
    override async onKeyDown(ev: KeyDownEvent<CooldownSettings>): Promise<void> {
        const actionId = ev.action.id;
        const { duration = 60 } = ev.payload.settings;
        
        // Start countdown
        const endTime = Date.now() + (duration * 1000);
        await ev.action.setSettings({ ...ev.payload.settings, endTime, isRunning: true });
        
        // Update every second
        const timer = setInterval(async () => {
            const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
            await ev.action.setTitle(`${remaining}s`);
            
            if (remaining === 0) {
                clearInterval(timer);
                this.timers.delete(actionId);
                await ev.action.setSettings({ ...ev.payload.settings, isRunning: false });
                await ev.action.showOk();
            }
        }, 1000);
        
        this.timers.set(actionId, timer);
    }
    
    override onWillDisappear(ev: WillDisappearEvent<CooldownSettings>): void {
        // Clean up timer
        const timer = this.timers.get(ev.action.id);
        if (timer) {
            clearInterval(timer);
            this.timers.delete(ev.action.id);
        }
    }
}
```

## Key Considerations

### 1. Timer Storage
- Use `Map<string, NodeJS.Timeout>` to track timers
- Key by `ev.action.id` (unique per button instance)
- Allows multiple buttons with independent timers

### 2. Cleanup
- **Critical**: Always clear intervals in `onWillDisappear`
- Prevents memory leaks
- Stops updates when button removed or page changes

### 3. Time Calculation
- Store `endTime` (timestamp) in settings
- Calculate remaining time: `endTime - Date.now()`
- Survives brief disconnections/restarts

### 4. Update Frequency
- 1 second interval for countdown display
- Balance between accuracy and performance
- Don't update more frequently than needed

### 5. Settings Type
```typescript
type CooldownSettings = {
    duration?: number;      // Cooldown duration in seconds
    endTime?: number;       // Unix timestamp when cooldown ends
    isRunning?: boolean;    // Whether timer is active
    label?: string;         // Custom label for the spell
};
```

## Examples from Documentation

### Cat Keys Auto-Update Pattern
- Uses 15-minute interval for API polling
- Stores intervals in Map
- Cleans up in onWillDisappear

### Long Press Timer Pattern
```typescript
private longPressTimer?: NodeJS.Timeout;

override onKeyDown(ev: KeyDownEvent): void {
    this.longPressTimer = setTimeout(async () => {
        // Handle long press
    }, 2000);
}

override onKeyUp(ev: KeyUpEvent): void {
    if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
    }
}
```

## Features to Implement

1. **Basic Countdown**
   - Start timer on key press
   - Update display every second
   - Alert on completion

2. **Configuration**
   - Configurable duration via Property Inspector
   - Custom spell name/label
   - Optional sound/alert on completion

3. **Pause/Resume**
   - Long press to pause
   - Press again to resume

4. **Multiple Timers**
   - Each button is independent
   - State tracked per instance

5. **Persistence**
   - Store endTime in settings
   - Resume on plugin restart if still running
