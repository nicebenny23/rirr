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
        var foodprod = $('#new-food-prod').val();
        var fooddrop = $('#new-food-drop').val();
        var lifespan = $('#new-lifespan').val();
        var movercost = $('#new-mover-cost').val();
        this.events.push(new WorldEvent(time, foodprod, fooddrop, lifespan, movercost));
        this.updateEventsList();
    }

    removeEvent() {
        if(this.events.length > 0) this.events.pop();
        this.updateEventsList();
    }

    updateEventsList() {
        var eventslist = [];
        //console.log(this.events.length);
        this.events.forEach(ev => {
            eventslist.push("[" + ev.time + "] FP: " + ev.foodprod + " FD: " + ev.fooddrop + " LS: " + ev.lifespan + " MC: " + ev.movercost + "<br>");
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
        this.events.forEach(event => {
            if(!event.completed && this.environment.total_ticks >= event.time) {
                this.performEvent(event);
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