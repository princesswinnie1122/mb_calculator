var boxNames = {};
var boxCounter = 0;

var materialDataArray = []; 
var materialCounter = 0;

const boxToLinesMap = new Map();

document.addEventListener('DOMContentLoaded', function() {
    
    document.querySelector('.add').addEventListener('click', function() {
        var box = document.createElement('div');
        box.className = 'box';
        box.tabIndex = 0;
        boxCounter += 1;
        box.dataset.boxId = boxCounter;

        var canvas = document.querySelector('.canvas');

        var boxText = document.createElement('div');
        boxText.className = 'box-text';
        boxText.textContent = 'Double-click to edit';
        box.appendChild(boxText);

        ['top', 'right', 'bottom', 'left'].forEach(function(position) {
            var circle = document.createElement('div');
            circle.className = 'circle ' + position;
            box.appendChild(circle);
        });

        canvas.appendChild(box);
        new PlainDraggable(box);

        let isDoubleClick = false; 

        box.addEventListener('dblclick', function(event) {
            if(boxText.textContent === 'Double-click to edit'){boxText.textContent = '';}
            if(event.target !== canvas){
                boxText.contentEditable = true;
                box.classList.add('focused');
                boxText.focus();
            }
        });

        box.addEventListener('input', function() {
            if (boxText.textContent !== 'Double-click to edit' && boxText.textContent.trim() != '') {
                boxNames[box.dataset.boxId] = boxText.textContent;
            }
            updateSelectOptions();
            console.log(boxNames);
        });
        
        box.addEventListener('blur', function() {
            boxText.contentEditable = false;
        });
        
        box.addEventListener('click', function() {
            if (!isDoubleClick) {
                document.querySelectorAll('.box.focused').forEach(function(otherBox) {
                    otherBox.classList.remove('focused');
                });
            }
            box.classList.add('focused');
            isDoubleClick = false;
        });

        box.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();  
                boxText.blur();  
                boxText.contentEditable = false;  
                box.classList.remove('focused');
            }
        });

        canvas.addEventListener('click', function(event) {
            if (event.target !== box && event.target !== boxText) {
                box.classList.remove('focused');
                    boxText.blur();
            }
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Delete') {
                var focusedBox = document.querySelector('.box.focused');
                if (focusedBox) {
                    delete boxNames[focusedBox.dataset.boxId];
                    focusedBox.remove();
                    updateSelectOptions();
                }
            }            
        });   
    }); 
});

function updateSelectOptions() {
    var selects = document.querySelectorAll('.connectors select');

    selects.forEach(function(select) {
        // Clear out existing options
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }

        // Create a default empty option
        var defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select Unit --';
        select.appendChild(defaultOption);

        // Add box names as options
        for (var boxId in boxNames) {
            var option = document.createElement('option');
            option.value = boxId;
            option.textContent = boxNames[boxId];
            select.appendChild(option);
        }
    });
}

updateSelectOptions();

document.getElementById('add-material-btn').addEventListener('click', function() {
    let selects = document.querySelectorAll('.connectors select');
    let startBoxId = selects[0].value;
    let endBoxId = selects[1].value;
    let startBox = document.querySelector(`.box[data-box-id="${startBoxId}"]`);
    let endBox = document.querySelector(`.box[data-box-id="${endBoxId}"]`);
    
    let line = new LeaderLine(startBox, endBox, {
        color: 'white', 
        size: 2.5,
        endPlugSize: 1.5,
        // path: 'straight',
        hide: true,  
        animOptions: {duration: 2000},
        id: 'line'
    });

    addLineToMap(startBox, endBox, line);

    setTimeout(() => {
        line.position();
        line.show('draw'); 
    }, 10);    

    // Update line position when startBox is moved
    let startDraggable = new PlainDraggable(startBox);
    startDraggable.onMove = function() {
        line.position();
        updateLinesForBox(startBox);
    };

    // Update line position when endBox is moved
    let endDraggable = new PlainDraggable(endBox);
    endDraggable.onMove = function() {
        line.position();
        updateLinesForBox(endBox);
    };

    // Update Added Material Data
    var materialElement = document.querySelector('.material');
    var materialName = materialElement.querySelector('.material-name').value;
    var molecularWeight = materialElement.querySelector('.molecular-weight').value;
    var mole = materialElement.querySelector('.mole').value;
    var massAmount = materialElement.querySelector('.mass-amount').value;
    var massUnit = materialElement.querySelector('.mass-unit').value;

    // Construct the material data object
    var materialData = {
        Unit1: startBoxId, // TODO: Retrieve box name for Unit1
        Unit2: endBoxId, // TODO: Retrieve box name for Unit2
        Material: materialName,
        MolecularWeight: molecularWeight || null, // If no value is provided, set to null
        Mole: mole || null,
        Mass: massAmount ? massAmount + massUnit : null // If massAmount is provided, concatenate with unit
    };

    // Push the material data to the array
    materialDataArray.push(materialData);

    // Increase the counter
    materialCounter++;

    console.log(materialDataArray); // Log the array for verification
});


function addLineToMap(startBox, endBox, line) {
    if (!boxToLinesMap.has(startBox)) {
        boxToLinesMap.set(startBox, []);
    }
    if (!boxToLinesMap.has(endBox)) {
        boxToLinesMap.set(endBox, []);
    }

    boxToLinesMap.get(startBox).push(line);
    boxToLinesMap.get(endBox).push(line);
}

function updateLinesForBox(box) {
    const lines = boxToLinesMap.get(box) || [];
    for (const line of lines) {
        line.position();
    }
}


function updateInputVisibility(section, type) {
    section.querySelector('.molecular-inputs').style.display = type === 'molecular' ? 'block' : 'none';
    section.querySelector('.mass-inputs').style.display = type === 'mass' ? 'block' : 'none';
}

document.querySelectorAll('.switcher .option').forEach(function(option) {
    option.addEventListener('click', function() {
        var section = option.closest('.switch-container');
        var type = option.dataset.type;

        section.querySelectorAll('.option').forEach(function(opt) {
            opt.classList.remove('selected');
        });
        option.classList.add('selected');
        updateInputVisibility(section, type);
    });
});

document.querySelectorAll('.switcher .option.molecular').forEach(function(option) {
    option.click();
});



















  



  



  







