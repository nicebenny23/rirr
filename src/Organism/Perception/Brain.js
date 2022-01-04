const Hyperparams = require("../../Hyperparameters");
const Directions = require("../Directions");
const CellStates = require("../Cell/CellStates");

const Decision = {
    getRandom: function(){
        return Math.random() * 4 - 2;
    },
    getRandomDelta: function(){
        return Math.random() - 0.5;
    }
}

class Brain {
    constructor(owner){
        this.owner = owner;
        this.observations = [];

        // corresponds to CellTypes
        this.decisions = [];
        this.decisions[CellStates.empty.name] = 0;
        this.decisions[CellStates.food.name] = 1.5;
        this.decisions[CellStates.wall.name] = 0;
        this.decisions[CellStates.mouth.name] = 0;
        this.decisions[CellStates.producer.name] = 0;
        this.decisions[CellStates.mover.name] = 0;
        this.decisions[CellStates.killer.name] = -1.5;
        this.decisions[CellStates.armor.name] = 0;
        this.decisions[CellStates.eye.name] = 0;
    }

    randomizeDecisions(randomize_all=false) {
        // randomize the non obvious decisions
        if (randomize_all) {
            this.decisions[CellStates.food.name] = Decision.getRandom();
            this.decisions[CellStates.killer.name] = Decision.getRandom();
        }
        this.decisions[CellStates.mouth.name] = Decision.getRandom();
        this.decisions[CellStates.producer.name] = Decision.getRandom();
        this.decisions[CellStates.mover.name] = Decision.getRandom();
        this.decisions[CellStates.armor.name] = Decision.getRandom();
        this.decisions[CellStates.eye.name] = Decision.getRandom();
    }

    observe(observation) {
        this.observations.push(observation);
    }

    decide() {
        var desired_direction_x = Directions.scalars[this.owner.direction][0];
        var desired_direction_y = Directions.scalars[this.owner.direction][1];
        for (var obs of this.observations) {
            if (obs.cell == null) {
                continue;
            }
            // console.log(obs.cell.state)
            var decision_weight = this.decisions[obs.cell.state.name];
            // console.log(decision_weight)
            desired_direction_x += decision_weight * Directions.scalars[obs.direction][0] * (1.5 - (obs.distance / Hyperparams.lookRange));
            desired_direction_y += decision_weight * Directions.scalars[obs.direction][1] * (1.5 - (obs.distance / Hyperparams.lookRange));
        }
        this.observations = [];
        //convert the desired direction vector into the closest world direction
        var new_direction;
        if (Math.abs(desired_direction_x) > Math.abs(desired_direction_y)) {
            if (desired_direction_x > 0) {
                new_direction = Directions.right;
            } else {
                new_direction = Directions.left;
            }
        } else {
            if (desired_direction_y < 0) {
                new_direction = Directions.up;
            } else {
                new_direction = Directions.down;
            }
        }
        //check if the direction has changed
        if (new_direction != this.owner.direction) {
            this.owner.changeDirection(new_direction);
            return true;
        }
        return false;
    }

    mutate() {
        var cell = CellStates.getRandomName();
        this.decisions[cell] += Decision.getRandomDelta(); //change by a tiny amount [-0.5, 0.5]
        this.decisions[cell] = Math.max(-2, Math.min(this.decisions[cell], 2)); //clamp to [-2, 2]
        this.decisions[CellStates.empty.name] = 0; // if the empty cell has a decision it gets weird
    }
}

Brain.Decision = Decision;

module.exports = Brain;