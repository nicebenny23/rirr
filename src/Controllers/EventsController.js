const Hyperparams = require("../Hyperparameters");
const ControlPanel = require("../Controllers/ControlPanel");
const WorldEnvironment = require("../Environments/WorldEnvironment");

class EventsController {
    constructor(env) {
        this.environment = env;
        this.events = [];
        this.defineEventControls();
    }

    defineEventControls() {
        $('#add-event').click(() => {
            this.createEvent();
        });
        $('#remove-event').click(() => {
            this.removeEvent();
        });
    }

    createEvent() {
        var time = $('#event-time').val();
        if(time <= this.environment.total_ticks) {
            confirm("OVERDUE EVENT\nCannot add event in the past.");
            return false;
        }
        for (let i = 0; i < this.events.length; i++) {
            if(this.events[i].time == time) {
                if(confirm("EXISTING EVENT\nDo you want to overwrite the event at "+time+" ticks?")) {
                    this.events.splice(i, 1);
                    break;
                }
                else {
                    return false;
                }
            }
        }
        var foodprod = $('#new-food-prod').val();
        var fooddrop = $('#new-food-drop').val();
        var lifespan = $('#new-lifespan').val();
        var movercost = $('#new-mover-cost').val();
        this.events.push(new WorldEvent(time, foodprod, fooddrop, lifespan, movercost));
        this.events.sort((a, b) => a.time - b.time);
        this.updateEventsList();
        return true;
    }

    removeEvent() {
        if(this.events.length == 0) return false;
        var time = $('#event-time').val();
        for (let i = 0; i < this.events.length; i++) {
            if(this.events[i].time == time) {
                this.events.splice(i, 1);
                this.updateEventsList();
                return true;
            }
        }
        confirm("404 EVENT NOT FOUND\nNo event found at "+time+" ticks.");
        return false;
    }

    updateEventsList() {
        var eventslist = [];
        //console.log(this.events.length);
        this.events.forEach(ev => {
            eventslist.push((ev.completed?"<s>[":"[")+ev.time+"] FP: "+ev.foodprod+", FD: "+
            ev.fooddrop+", LS: "+ev.lifespan+", MC: "+ev.movercost+(ev.completed?"</s> <br>":"<br>"));
        });
        $('.events-list').html(eventslist);
    }

    updateParameters() {
        $('#food-prod-prob').val(Hyperparams.foodProdProb);
        $('#lifespan-multiplier').val(Hyperparams.lifespanMultiplier);
        $('#food-drop-rate').val(Hyperparams.foodDropProb);
        $('#extra-mover-cost').val(Hyperparams.extraMoverFoodCost);
    }

    scanEvents() {
        this.events.forEach(ev => {
            if(!ev.completed && this.environment.total_ticks >= ev.time) {
                this.performEvent(ev);
                return true;
            }
        });
        return false;
    }

    performEvent(event) {
        Hyperparams.foodProdProb = event.foodprod;
        Hyperparams.foodDropProb = event.fooddrop;
        Hyperparams.lifespanMultiplier = event.lifespan;
        Hyperparams.extraMoverFoodCost = event.movercost;

        console.log("World event happened at " + event.time);
        event.completed = true;
        this.updateParameters();
        this.updateEventsList();
    }

    Reset() {
        this.events.forEach(event => {event.completed = false});
        this.updateEventsList();
    }
}

class WorldEvent {
    constructor(t, fp, fd, ls, mc) {
        this.time = t;
        this.foodprod = fp;
        this.fooddrop = fd;
        this.lifespan = ls;
        this.movercost = mc;
        this.completed = false;
    }
}

module.exports = EventsController;