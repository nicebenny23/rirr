const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Hyperparams = require("../../../Hyperparameters");

class KillerCell extends BodyCell{
    constructor(org, loc_col, loc_row){
        super(CellStates.killer, org, loc_col, loc_row);
    }

    performFunction() {
        var env = this.org.env;
        var c = this.getRealCol();
        var r = this.getRealRow();
        for (var loc of Hyperparams.killableNeighbors) {
            var cell = env.grid_map.cellAt(c+loc[0], r+loc[1]);
            this.killNeighbor(cell);
        }
    }

    killNeighbor(n_cell) {
        // console.log(n_cell)
        if(n_cell == null || n_cell.owner == null || n_cell.owner == this.org || !n_cell.owner.living || n_cell.state == CellStates.armor) 
            return;
        var env = n_cell.owner.env;
        var is_hit = n_cell.state == CellStates.killer; // has to be calculated before death
        var is_protected = false;
        for (var loc of Hyperparams.protectedNeighbors) {
            var cell = env.grid_map.cellAt(n_cell.col+loc[0], n_cell.row+loc[1]);
            if(cell != null && cell.state == CellStates.armor && cell.owner == n_cell.owner) {
                is_protected = true;
                break;
            }
        }
        if (!is_protected) {
            n_cell.owner.harm();   
        }
        if (Hyperparams.instaKill && is_hit) {
            this.org.harm();
        }
    }
}

module.exports = KillerCell;
