const mongoose = require('mongoose');

const NotebookSchema = new mongoose.Schema({
    classId: {
        type: String,
        required: true
    },
    pages: {
        type: Array,
        validate: {
            validator: function (v) {
                return v.length === this.totalPages
            }
        }
    }
})

const NotebookModel = mongoose.model("NoteBook", NotebookSchema);

module.exports=NotebookModel;