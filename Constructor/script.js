// красным подствечена зона вне пределов действия пушки корабля
// белым выделено поле размещения зерга для игрового уровня

var FIELD_WIDTH = 25; // ширина поля 25x20px = 500px
var FIELD_HEIGHT = 32; // высота поля 32x20px = 640px

var gameMatrix; // матрица игры

//--OK генерация зерга для возможности загрузки и просмотра готовых уровней (отличается от аналогичного объекта основной программы очисткой классов раскрашенных ячеек)
var zerg = {
    
    //--OK - начальная генерация зерга на поле
    // параметр вида level.l_1
    generate: function(lvl){
        
        for (let i = 0; i < lvl.length; i++){
            let cell = document.getElementById(lvl[i][0]);
            
            cell.classList = 'cell';
            cell.classList.toggle('zerg'); // вкл
            cell.classList.toggle(lvl[i][1]); //вкл
        }
    }
}

//--OK генерация игрового поля с очисткой содержимого и расцветкой областей
function field_generate(width,height) {

    let field = document.querySelector('.field');
    field.innerHTML = '';

    for (let i = 0; i < height; i++) {

        let line = document.createElement('div');
        line.className = 'line line-' + i;
        field.appendChild(line);


        for (let j = 0; j < width; j++) {
            let element = document.createElement('div');
            element.className = 'cell empty';
            
            if ((j>0&&j<=3) || (j>=width-4&&j<width-1)){
                element.classList.toggle('grey');
            }
            
            if (j===0 || j===(width-1)){
                element.classList.toggle('red');
            }
            
            if (i>(height/2)-1){
                if(!element.classList.contains('grey') && !element.classList.contains('red')){
                element.classList.toggle('grey');
                }
            }
            
            element.id = (j + '-' + i); //id - координаты XY
            line.appendChild(element);
        }
    }
}

//--OK установка в кликнутый блок юнита соответствующего выбранному в radio-button
function changeZergElement(eventObj){
    
    let radios = document.getElementsByTagName('input');
    
    if(radios[0].checked){
        eventObj.target.classList = 'cell empty';
        }
    else if (radios[1].checked){
        eventObj.target.classList = 'cell';
        eventObj.target.classList.toggle('zerg');
        eventObj.target.classList.toggle('z-1');
        }
    else if (radios[2].checked){
        eventObj.target.classList = 'cell';
        eventObj.target.classList.toggle('zerg');
        eventObj.target.classList.toggle('z-2');
        }
    else if (radios[3].checked){
        eventObj.target.classList = 'cell';
        eventObj.target.classList.toggle('zerg');
        eventObj.target.classList.toggle('z-3');
        }
    else if (radios[4].checked){
        eventObj.target.classList = 'cell';
        eventObj.target.classList.toggle('zerg');
        eventObj.target.classList.toggle('z-4');
        }
    else if (radios[5].checked){
        eventObj.target.classList = 'cell';
        eventObj.target.classList.toggle('zerg');
        eventObj.target.classList.toggle('z-5');
        }  
}

//--OK очищает gameMatrix от предыдущего значения и заполняем текущим зергом
function makeMatrix (){
    
    gameMatrix = [];
    
    let zergs = document.querySelectorAll('.zerg');
    for (let i = 0; i<zergs.length; i++){
        
        let id = zergs[i].id;
        let clsArr = zergs[i].classList.value;
        let cls = clsArr.split(' ');
        
        gameMatrix[i] = [id, cls[2]];
    }
}

//--OK заполнение текстового блока позициями зерга для дальнейшего копирования
function prepareToCopy(){
    
    //очистка ранее заполненного поля
    let output = document.getElementById('output');
    output.innerHTML=('');
    
    for (let i = 0; i<gameMatrix.length; i++){
        
        //последний элемент матрицы без запятой в конце
        if (i === gameMatrix.length-1){
            output.innerHTML+=("['"+gameMatrix[i][0]+"','"+gameMatrix[i][1]+"']");
        }
        else {
            output.innerHTML+=("['"+gameMatrix[i][0]+"','"+gameMatrix[i][1]+"'],");
        }
    }
}

//--OK listener для клика по ячейке
function clicker (){
    let element = document.getElementsByClassName('cell');
    for (let i = 0; i<element.length; i++){
        element[i].onclick = changeZergElement;
    }
}



field_generate(FIELD_WIDTH,FIELD_HEIGHT);
clicker();

//--OK listener для клика по кнопке
document.getElementById('button').onclick = function(){
    makeMatrix();
    prepareToCopy();
}


//zerg.generate(level.game_win);
