const fs = require('fs');

class SparseMatrix {
    constructor(numRows, numCols) {
        this.numRows = numRows;
        this.numCols = numCols;
        this.data = {}; 
    }

    static fromFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        const rowInfo = lines[0].split('=')[1].trim();
        const colInfo = lines[1].split('=')[1].trim();

        const numRows = parseInt(rowInfo);
        const numCols = parseInt(colInfo);
        const matrix = new SparseMatrix(numRows, numCols);

        for (let i = 2; i < lines.length; i++) {
            const entry = lines[i].trim();

            if (!entry.match(/^\(\d+,\s*\d+,\s*-?\d+\)$/)) {
                throw new Error('Input file has wrong format');
            }

            const [row, col, value] = entry.slice(1, -1).split(',').map(Number);
            if (value !== 0) {
                matrix.setElement(row, col, value);
            }
        }

        return matrix;
    }

    getElement(row, col) {
        return this.data[`${row},${col}`] || 0;
    }

    setElement(row, col, value) {
        if (value === 0) {
            delete this.data[`${row},${col}`];
        } else {
            this.data[`${row},${col}`] = value;
        }
    }

    add(matrix) {
        if (this.numRows !== matrix.numRows || this.numCols !== matrix.numCols) {
            throw new Error("Matrices dimensions do not match for addition");
        }

        const result = new SparseMatrix(this.numRows, this.numCols);
        for (const key in this.data) {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, this.getElement(row, col) + matrix.getElement(row, col));
        }

        for (const key in matrix.data) {
            const [row, col] = key.split(',').map(Number);
            if (!this.data.hasOwnProperty(key)) {
                result.setElement(row, col, matrix.getElement(row, col));
            }
        }

        return result;
    }

    subtract(matrix) {
        if (this.numRows !== matrix.numRows || this.numCols !== matrix.numCols) {
            throw new Error("Matrices dimensions do not match for subtraction");
        }

        const result = new SparseMatrix(this.numRows, this.numCols);
        for (const key in this.data) {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, this.getElement(row, col) - matrix.getElement(row, col));
        }

        for (const key in matrix.data) {
            const [row, col] = key.split(',').map(Number);
            if (!this.data.hasOwnProperty(key)) {
                result.setElement(row, col, -matrix.getElement(row, col));
            }
        }

        return result;
    }

    multiply(matrix) {
        if (this.numCols !== matrix.numRows) {
            throw new Error("Matrix multiplication not possible: incompatible dimensions");
        }

        const result = new SparseMatrix(this.numRows, matrix.numCols);
        for (const keyA in this.data) {
            const [rowA, colA] = keyA.split(',').map(Number);
            for (const keyB in matrix.data) {
                const [rowB, colB] = keyB.split(',').map(Number);
                if (colA === rowB) {
                    const newValue = result.getElement(rowA, colB) + this.getElement(rowA, colA) * matrix.getElement(rowB, colB);
                    result.setElement(rowA, colB, newValue);
                }
            }
        }

        return result;
    }
}

function main() {
    try {
        const matrix1 = SparseMatrix.fromFile('sample inputs\\easy_sample_01_1.txt');
        const matrix2 = SparseMatrix.fromFile('sample inputs\\easy_sample_01_2.txt');

        const operation = process.argv[2]; 

        let result;
        switch (operation) {
            case 'add':
                result = matrix1.add(matrix2);
                break;
            case 'subtract':
                result = matrix1.subtract(matrix2);
                break;
            case 'multiply':
                result = matrix1.multiply(matrix2);
                break;
            default:
                throw new Error("Invalid operation selected");
        }

        console.log('Operation successful, result matrix:');
        console.log(result.data);
    } catch (err) {
        console.error(err.message);
    }
}

main();
