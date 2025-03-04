const mongoose = require('mongoose')
const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question is required'],
    },
    answerType: {
        type: String,
        enum: ['Numerical', 'SingleCorrect', 'MultiCorrect'],
        required: [true, 'Answer type is required'],
    },
    marks: {
        type: Number,
        required: true,
    },
    options: {
        type: [String],
        validate: {
            validator: function (v) {
                if (this.answerType.toLowerCase() === 'numerical') return v.length === 0;
                else return v.length >= 2
            },
            message: 'Invalid options for the given answer type',
        },
    },
    answer: {
        type: [Number],
        required: [true, 'Answer is required'],
        validate: {
            validator: function (v) {
                if (this.answerType.toLowerCase() === 'numerical' || this.answerType.toLowerCase() == 'singlecorrect') return v.length === 1;
                return v.length <= this.options.length;
            },
            message: 'Answer length must not exceed options length',
        },
    },
});

// Result Schema
const resultSchema = new mongoose.Schema({
    totalScore: {
        type: Number,
        required: true
    },
    scores: {
        type: [Number],
    },
});

// Test Schema
const testSchema = new mongoose.Schema({
    testId: {
        type: String,
        unique: [true, 'Test ID must be unique'],
        required: [true, 'Test ID is required'],
    },
    classId: {
        type: String,
        required: [true, 'Class ID is required'],
    },
    testType: {
        type: String,
        enum: ['Standard', 'Custom'],
        required: [true, 'Test Type is required'],
    },
    questionForCustomTest: {
        type: String,
        validate: {
            validator: function (v) {
                if (this.testType.toLowerCase() === 'custom') {
                    return v && v.length > 0;
                }
                return true;
            },
            message: 'Question for this custom test is required',
        },
    },
    questionForStandardTest: [questionSchema],
    startDate: {
        type: Date,
        required: [true, 'Test date is required'],
    },
    startTime: {
        type: String, // Manage as HH:MM format
        required: [true, 'Test time is required'],
        validate: {
            validator: (v) => {
                if (v.length !== 5) return false;
                const hours = Number(`${v[0]}${v[1]}`), minutes = Number(`${v[3]}${v[4]}`)
                if (v[2] !== ':' || hours >= 24 || hours < 0 || minutes < 0 || minutes >= 60) return false;
                return true;
            },
            message: 'Start time must be in HH:MM format(24 hours format)    '
        }
    },
    duration: {
        type: Number, // Duration in hours
        required: [true, 'Duration is required'],
    },
    completed: {
        type: Boolean,
        required: true,
    },
    response: {
        type: Array,
        validate: {
            validator: function (v) {
                if (!this.completed) return v.length === 0;
                if (this.completed && this.testType.toLowerCase() === 'standard') return v.length === 1;
                return true;
            },
            message: 'Invalid response data',
        },
    },
    feedback: {
        type: Array,
        validate: {
            validator: function (v) {

                return (
                    (v.length === 0) ||
                    (this.testType.toLowerCase() === 'custom' && v.length === 1) ||
                    (this.testType.toLowerCase() === 'standard' && v.length === this.questionForStandardTest.length)
                );
            },
            message: 'Invalid feedback data',
        },
    },
    result: {
        type: resultSchema,
        validate: {
            validator: function (v) {

                return (
                    (v.length == 0) ||
                    (this.testType.toLowerCase() === 'custom' && v.scores.length == 0) ||
                    (this.testType.toLowerCase() === 'standard' && v.scores.length === this.questionForStandardTest.length)
                );


            },
            message: 'Invalid result data',
        },
    },
    maxScore: {
        type: Number,
        required: [true, 'Max score is required']
    },
});

const testModel=mongoose.model('test',testSchema);

module.exports=testModel;