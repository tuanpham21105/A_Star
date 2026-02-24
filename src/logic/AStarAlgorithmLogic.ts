import { MinPriorityQueue } from "@datastructures-js/priority-queue"
import { connected } from "process";

type ConnectedState = {
    state: string;
    k: number;
}

type State = {
    state: string;
    h: number;
    connectedStates: ConnectedState[]
}

export function Solve(input: string) : string {
    reset()

    parseInputFromText(input)

    solve()

    return "Steps:\n" + stepsText + "Path: " + pathText +"\nCost: " + cost; 
} 

// Input data
let startState: string = ''
let endState: string = ''

let states: State[] = []

function findState(state: string) : State|undefined {
    const res = states.find(s => s.state === state);
    return res;
}

function parseInputFromText(text: string) {
    const lines = text.split("\n")

    startState = lines[0].trim()
    endState = lines[1].trim()

    const stateLines = lines.slice(2)
    stateLines.forEach(line => {
        if (line.trim() === "") return

        let state: State = {state: "", h: 0, connectedStates: []}

        const lineParts = line.split(":")

        const stateParts = lineParts[0].split("-")
        state.state = stateParts[0].trim()
        state.h = Number.parseInt(stateParts[1].trim())

        if (lineParts.length == 1) {
            states.push(state)
            return
        }

        const connectedStatesParts = lineParts[1].split(",")
        
        if (connectedStatesParts.length == 0) return

        connectedStatesParts.forEach(part => {
            let connect: ConnectedState = {state: "", k: 0}

            const p = part.split("-")

            connect.state = p[0].trim()
            connect.k = Number.parseInt(p[1].trim())

            state.connectedStates.push(connect)
        })

        states.push(state)
    })
}

let stepsText: string = ''
let pathText: string = ''
let cost: number = 0

function solve() {
    // Runtime solve data
    let steps: number = 0
    const pq = new MinPriorityQueue<{state: string, priority: number}>(n => n.priority)
    const marker = new Map<string, string>()

    pq.push({state: startState, priority: 0})
    stepsText += steps + "\t|" + "\t|" + "\t|" + "\t|" + "\t|" + "\t|" + "\t|" + "\t|" + queueToString(pq) + "\n"

    while (!pq.isEmpty()) {
        steps += 1

        const pqTop = pq.pop()

        if (!pqTop) break;

        const currentState = findState(pqTop.state);

        if (currentState?.state === endState) {
            cost = pqTop.priority - currentState.h
            stepsText += steps + "\t|" + endState + "\t|" + "Trạng thái kết thúc - Dừng" + "\t|" + "\t|" + "\t|" + "\t|" + "\t|" + "\t|" + "\n"
            break
        }

        currentState?.connectedStates.forEach(connectedState => {
            const nextState = states.find(s => s.state === connectedState.state)

            if (!nextState) return

            marker.set(nextState.state, currentState.state)

            const k = connectedState.k
            const h = nextState.h
            const g = k + Math.max(pqTop.priority - currentState.h, 0)
            const f = g + h

            pq.push({state: nextState.state, priority: f})

            stepsText += 
                steps + "\t|" + 
                currentState.state + "\t|" + 
                nextState.state + "\t|" + 
                k + "\t|" + 
                h + "\t|" + 
                g + "\t|" + 
                f + "\t|" + 
                queueToString(pq) + "\t|" + "\n"
        })
    }

    let reverseState = endState
    pathText = endState

    while (true) {
        const parent = marker.get(reverseState)
        if (!parent) break                     
        pathText = parent + " -> " + pathText   
        reverseState = parent                    
    }
}

function queueToString(pq: MinPriorityQueue<{state: string, priority: number}>): string {
    const items = pq.toArray()
    return "[" + items.map(n => `(${n.state}-${n.priority})`).join(", ") + "]"
}

function reset() {
    startState = ''
    endState = ''
    states = []
    stepsText = ''
    cost = 0
}