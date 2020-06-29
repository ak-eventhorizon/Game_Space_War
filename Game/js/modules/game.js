'use strict';

import { level } from "./levels.js";

const FIELD_WIDTH = 25; // ширина поля 25 клеток
const FIELD_HEIGHT = 32; // высота поля 32 клетки

const MAX_LEVEL = 10; //всего уровней, для проверки на выигрыш

const BULLET_SPEED = 50; // интервал времени перемещения пули
const Z_SPEED = 1000; // интервал времени перемещения зерга
const ZBULLET_SPEED = 200; // интервал времени перемещения пули зергов
const ZBULLETS = 1; //количество выстрелов в залпе зерга

let scoreValue; // значение поля интерфейса score
let levelValue; // значение поля интерфейса level
let retry; // количество повторов в случае проигрыша

let zCounter = 0; // для реализации траектории зерга
let zDirection = 'right'; //для реализации траектории зерга

let I1; //переменная для сохранения интервала bullet
let I2; //переменная для сохранения интервала zbullet
let I3; //переменная для сохранения интервала trajectory


//--OK методы объекта гененируют различные части интерфейса
let ui = {
    
    //--OK первоначальная генерация всего интерфейса
    generateCore: function(){
        let ui = document.querySelector('.interface');
        ui.innerHTML = ``; //очистка содержимого блока

        let score = document.createElement('div');
        score.className = `score`;
        score.innerHTML = `${scoreValue}`;
        ui.appendChild(score);

        let lives = document.createElement('div');
        lives.className = `lives`;
        lives.innerHTML = `*****`;
        ui.appendChild(lives);

        let level = document.createElement('div');
        level.className = `level`;
        level.innerHTML = `- ${levelValue} -`;
        ui.appendChild(level);
        
        let button = document.createElement('div');
        button.className = `button newGame`;
        button.innerHTML = `Start`;
        ui.appendChild(button);

        // добавление кнопок для управления на сенсорных экранах
        let controls = document.querySelector('.controls');
        controls.innerHTML = ``; //очистка содержимого блока
        let controlLeft = document.createElement('div');
        let controlSpace = document.createElement('div');
        let controlRight = document.createElement('div');
        controlLeft.id = 'btn-left';
        controlSpace.id = 'btn-space';
        controlRight.id = 'btn-right';
        controls.appendChild(controlLeft);
        controls.appendChild(controlSpace);
        controls.appendChild(controlRight); 
    },
    
    //--OK перегенерация значения поля score
    generateScore: function(){
        let score = document.querySelector('.score');
        score.innerHTML = ``;
        score.innerHTML = `${scoreValue}`;
    },

    //--OK перегенерация значения поля lives
    generateLives: function(){
        let lives = document.querySelector('.lives');
        lives.innerHTML = ``;
        lives.innerHTML = `*****`;
    },

    //--OK перегенерация значения поля level по параметру x
    generateLevel: function(x){
        let level = document.querySelector('.level');
        level.innerHTML = ``;
        level.innerHTML = `- ${x} -`;
    },
    
    //--OK перегенерация кнопки Start
    generateButtonNewGame: function(){
        let button = document.querySelector('.button');
        button.className = ``;
        button.innerHTML = ``;
        button.className = `button newGame`;
        button.innerHTML = `Start`;
        
        button.onclick = function(){
            game.new();
        };
    },
    
    //--OK перегенерация кнопки Pause
    generateButtonPause: function(){
        let button = document.querySelector('.button');
        button.className = ``;
        button.innerHTML = ``;
        button.className = `button pause`;
        button.innerHTML = `Pause`;
        
        button.onclick = function(){
            game.pause();
            ui.generateButtonUnPause();
        };
    },
    
    //--OK перегенерация кнопки UnPause
    generateButtonUnPause: function(){
        let button = document.querySelector('.button');
        button.className = ``;
        button.innerHTML = ``;
        button.className = `button unpause`;
        button.innerHTML = `UnPause`;
        
        button.onclick = function(){
            game.unPause();
            ui.generateButtonPause();
        };
    },
    
    //--OK перегенерация кнопки Next level
    generateButtonNextLevel: function(){
        let button = document.querySelector('.button');
        button.className = ``;
        button.innerHTML = ``;
        button.className = `button nextlevel`;
        button.innerHTML = `Next`;
        
        button.onclick = function(){
            game.nextLevel();
        };
    },
    
    //--OK перегенерация кнопки Retry
    generateButtonRetry: function(){
        let button = document.querySelector('.button');
        button.className = ``;
        button.innerHTML = ``;
        button.className = `button retry`;
        button.innerHTML = `Retry ('+retry+')`;
        
        button.onclick = function(){
            game.retry();
        };
    }
};

//--OK генерация игрового поля
let field = {
    
    //--OK генерация игрового поля с очисткой содержимого
    generate: function(width,height){
        let field = document.querySelector('.field');
        field.innerHTML = '';

        for (let i = 0; i < height; i++) {

            let line = document.createElement('div');
            line.className = 'line line-' + i;
            field.appendChild(line);

            for (let j = 0; j < width; j++) {
                let element = document.createElement('div');
                element.className = 'cell empty';
                element.id = (j + '-' + i);//id-координаты XY
                line.appendChild(element);
            }
        }
    }
};

//--OK якорь - центральная точка для отрисовки корабля и его перемещения
let anchor = {
    
    //--OK установка начальной позиции якоря
    toggleDefault: function(){
        
        // вычисление начальных координат якоря (низ середина)
        let anchorX = (FIELD_WIDTH-1)/2;
        let anchorY = FIELD_HEIGHT-1;
        
        let anchor = document.getElementById(''+anchorX+'-'+anchorY+'');
        anchor.classList.toggle('anchor');
    },
    
    //--OK движение якоря влево
    moveLeft: function(){
        
        let anchor = document.querySelector('.anchor');
        let coordAnchor = anchor.id.split('-');
        let x = +coordAnchor[0];
        let y = +coordAnchor[1];
        
        //ограничение на выход корабля за пределы поля (1 клетка от края слева)
        if((x-1) > 0){
            let anchorLeft = document.getElementById(''+(x-1)+'-'+y+'');

            // отключение класса у текущего якоря
            anchor.classList.toggle('anchor');

            //добавление класса новому якорю
            anchorLeft.classList.toggle('anchor');
        }
    },
    
    //--OK движение якоря вправо
    moveRight: function(){
        
        let anchor = document.querySelector('.anchor');
        let coordAnchor = anchor.id.split('-');
        let x = +coordAnchor[0];
        let y = +coordAnchor[1];
        
        //ограничение на выход корабля за пределы поля (1 клетка от края справа)
        if((x+1) < (FIELD_WIDTH-1)){
            let anchorRight = document.getElementById(''+(x+1)+'-'+y+'');

            // отключение класса у текущего якоря
            anchor.classList.toggle('anchor');

            //добавление класса новому якорю
            anchorRight.classList.toggle('anchor');
        } 
    }
};

//--OK корабль
let ship = {
    
    //--OK отрисовка или удаление корабля от якоря
    drawOrErase: function(){
        let anchor = document.querySelector('.anchor');
        let coordAnchor = anchor.id.split('-');
        let x = +coordAnchor[0];
        let y = +coordAnchor[1];
        
        //10 блоков для возможности различной отрисовки частей корабля (1 и 3 не используются)
        
        //                  10
        //                 7 8 9
        //                 4 5 6
        //                 1 2 3
        
        let block1 = document.getElementById(''+(x-1)+'-'+y+'');
        block1.classList.toggle('empty'); // откл
        block1.classList.toggle('ship'); // вкл
        block1.classList.toggle('block1'); // вкл
        
        let block2 = document.getElementById(''+x+'-'+y+'');
        block2.classList.toggle('empty');
        block2.classList.toggle('ship'); 
        block2.classList.toggle('block2');
        
        let block3 = document.getElementById(''+(x+1)+'-'+y+'');
        block3.classList.toggle('empty');
        block3.classList.toggle('ship');
        block3.classList.toggle('block3');
        
        let block4 = document.getElementById(''+(x-1)+'-'+(y-1)+'');
        block4.classList.toggle('empty');
        block4.classList.toggle('ship');
        block4.classList.toggle('block4');
        
        let block5 = document.getElementById(''+x+'-'+(y-1)+'');
        block5.classList.toggle('empty');
        block5.classList.toggle('ship');
        block5.classList.toggle('block5');
        
        let block6 = document.getElementById(''+(x+1)+'-'+(y-1)+'');
        block6.classList.toggle('empty');
        block6.classList.toggle('ship');
        block6.classList.toggle('block6');
        
        let block7 = document.getElementById(''+(x-1)+'-'+(y-2)+'');
        block7.classList.toggle('empty');
        block7.classList.toggle('ship');
        block7.classList.toggle('block7');
        
        let block8 = document.getElementById(''+x+'-'+(y-2)+'');
        block8.classList.toggle('empty');
        block8.classList.toggle('ship');
        block8.classList.toggle('block8');
        
        let block9 = document.getElementById(''+(x+1)+'-'+(y-2)+'');
        block9.classList.toggle('empty');
        block9.classList.toggle('ship');
        block9.classList.toggle('block9');
        
        let block10 = document.getElementById(''+x+'-'+(y-3)+'');
        block10.classList.toggle('empty');
        block10.classList.toggle('ship');
        block10.classList.toggle('block10');
        block10.classList.toggle('gun');
        
        //проверка на столкновение с зергом или пулей зерга
        ship.checkImpact();
        
    },
    
    //--OK перемещение влево
    moveLeft: function(){
        ship.drawOrErase(); // удаление корабля
        anchor.moveLeft(); // перемещение якоря
        ship.drawOrErase(); // отрисовка корабля
    },
    
    //--OK перемещение вправо
    moveRight: function(){
        ship.drawOrErase(); // удаление корабля
        anchor.moveRight(); // перемещение якоря
        ship.drawOrErase(); // отрисовка корабля
    },
    
    //--OK стрельба корабля
    fire: function(){
        bullet.generate();
    },
    
    //--OK столкновение корабля с зергом или пулей зерга
    checkImpact: function(){
        let shipArr = document.querySelectorAll('.ship');
        
        for (let i = (shipArr.length-1); i >= 0; i--){
            if((shipArr[i].classList.contains('zerg')) ||
              (shipArr[i].classList.contains('zbullet'))){
                game.over();
            }
        }
    }
};

//--OK пуля корабля
let bullet = {
    
    //--OK создание пули
    generate: function(){
        let gun = document.querySelector('.gun');
        let coordGun = gun.id.split('-');
        let x = +coordGun[0];
        let y = +coordGun[1];
        
        //отрисовка пули блоком выше пушки корабля
        let bullet = document.getElementById(''+x+'-'+(y-1)+'');
        bullet.classList.toggle('empty');
        bullet.classList.toggle('bullet');
    },
    
    //--OK полет пуль с проверкой на попадание и победу
    move: function(){
        
        //проверка на победу - если зергов не осталось
        if (document.querySelectorAll('.zerg').length === 0){
            game.win();
        }
        
        
        //выбираем все пули и смещаем каждую на один блок вверх
        let bullets = document.querySelectorAll('.bullet');
        
        for (let i = 0; i < bullets.length; i++){
            let bullet = bullets[i];
            let coordBullet = bullet.id.split('-');
            let x = +coordBullet[0];
            let y = +coordBullet[1];
            let nextBlock = document.getElementById(''+x+'-'+(y-1)+'');
            
            //следующий блок null (за пределами поля)
            if (nextBlock === null){
                bullet.classList.toggle('empty'); //вкл
                bullet.classList.toggle('bullet'); //откл
            } 
            //следующий блок имеет класс empty
            else if (nextBlock.classList.contains('empty')){
                bullet.classList.toggle('empty'); //вкл
                bullet.classList.toggle('bullet'); //откл
                nextBlock.classList.toggle('bullet'); //вкл
                nextBlock.classList.toggle('empty'); //откл
            }
            //следующий блок имеет класс zerg
            else if (nextBlock.classList.contains('zerg')){
                
                if (nextBlock.classList.contains('z-5')){
                    bullet.classList.toggle('empty'); //вкл
                    bullet.classList.toggle('bullet'); //откл
                    nextBlock.classList.toggle('z-5'); //откл
                    nextBlock.classList.toggle('z-4'); //вкл 
                }
                
                else if (nextBlock.classList.contains('z-4')){
                    bullet.classList.toggle('empty'); //вкл
                    bullet.classList.toggle('bullet'); //откл
                    nextBlock.classList.toggle('z-4'); //откл
                    nextBlock.classList.toggle('z-3'); //вкл
                }
                
                else if (nextBlock.classList.contains('z-3')){
                    bullet.classList.toggle('empty'); //вкл
                    bullet.classList.toggle('bullet'); //откл
                    nextBlock.classList.toggle('z-3'); //откл
                    nextBlock.classList.toggle('z-2'); //вкл
                }
                
                else if (nextBlock.classList.contains('z-2')){
                    bullet.classList.toggle('empty'); //вкл
                    bullet.classList.toggle('bullet'); //откл
                    nextBlock.classList.toggle('z-2'); //откл
                    nextBlock.classList.toggle('z-1'); //вкл
                }
                
                else if (nextBlock.classList.contains('z-1')){
                    bullet.classList.toggle('empty'); //вкл
                    bullet.classList.toggle('bullet'); //откл
                    nextBlock.classList.toggle('z-1'); //откл
                    nextBlock.classList.toggle('zerg'); //откл
                    nextBlock.classList.toggle('empty'); //вкл
                }
                
                //увеличение счета за попадание
                scoreValue++;
                ui.generateScore();    
            } 
            //следующий блок имеет класс zbullet
            else if (nextBlock.classList.contains('zbullet')){
                    bullet.classList.toggle('empty'); //вкл
                    bullet.classList.toggle('bullet'); //откл
                    nextBlock.classList.toggle('zbullet'); //откл
                    nextBlock.classList.toggle('empty'); //вкл
            }        
        }
    }
};

//--OK зерг
let zerg = {
    
    //--OK - начальная генерация зерга на поле
    // параметр вида level.l_1
    generate: function(lvl){
        
        for (let i = 0; i < lvl.length; i++){
            let cell = document.getElementById(lvl[i][0]);
            
            cell.classList.toggle('empty'); // откл
            cell.classList.toggle('zerg'); // вкл
            cell.classList.toggle(lvl[i][1]); //вкл
        }
    },
    
    //--OK - сдвиг зерга на клетку вправо
    moveRight: function() {
        
        //выбираются все блоки зерга и передвигаюся вправо по одному начиная с последнего
        let zArr = document.querySelectorAll('.zerg');
        
        for (let i = (zArr.length-1); i >= 0; i--){
            let currentCell = zArr[i];
            let arrID = zArr[i].id.split('-');
            let x = +arrID[0];
            let y = +arrID[1];
            
            let nextCell = document.getElementById(''+(x+1)+'-'+y+'');
            
            //если зерг сталкивается с кораблем
            if (nextCell.classList.contains('ship')){
                i = 0;
                game.over();
            }
            else {
            nextCell.classList.value = currentCell.classList.value;
            
            currentCell.classList.value = 'cell empty';
            }
        }
    },
    
    //--OK - сдвиг зерга на клетку влево
    moveLeft: function() {
        
        //выбираются все блоки зерга и передвигаюся влево по одному начиная с первого
        let zArr = document.querySelectorAll('.zerg');
        
        for (let i = 0; i <= (zArr.length-1); i++){
            let currentCell = zArr[i];
            let arrID = zArr[i].id.split('-');
            let x = +arrID[0];
            let y = +arrID[1];
            
            let nextCell = document.getElementById(''+(x-1)+'-'+y+'');
            
            //если зерг сталкивается с кораблем
            if (nextCell.classList.contains('ship')){
                i = zArr.length-1;
                game.over();
            }
            else {
            nextCell.classList.value = currentCell.classList.value;
            
            currentCell.classList.value = 'cell empty';
            }
        }
    },
    
    //--OK - сдвиг зерга на клетку вниз
    moveDown: function() {
        
        //выбираются все блоки зерга и передвигаюся вниз по одному начиная с последнего
        let zArr = document.querySelectorAll('.zerg');
        
        for (let i = (zArr.length-1); i >= 0; i--){
            let currentCell = zArr[i];
            let arrID = zArr[i].id.split('-');
            let x = +arrID[0];
            let y = +arrID[1];
            
            let nextCell = document.getElementById(''+x+'-'+(y+1)+'');
            
            //если зерг достигает нижнего края поля
            if (nextCell === null){
                i = 0;
                game.over();
            }
            //если зерг сталкивается с кораблем
            else if (nextCell.classList.contains('ship')){
                i = 0;
                game.over();
            }
            else {
                nextCell.classList.value = currentCell.classList.value;
            
                currentCell.classList.value = 'cell empty';
            }
        }
    },
    
    //--OK - стрельба зерга по игроку (n - количество выстрелов в залпе)
    fire: function(n) {
      zbullet.generate(n);  
    },
    
    //--OK реализация траектории движения зерга
    trajectory: function() {
        
        if (zDirection==='right' && zCounter===3){
            zerg.moveDown();
            zerg.fire(ZBULLETS);
            zDirection = 'left';
        }
        
        else if (zDirection==='left' && zCounter===-3){
            zerg.moveDown();
            zerg.fire(ZBULLETS);
            zDirection = 'right';
        }
        
        else if (zDirection==='right'){
            zerg.moveRight();
            zerg.fire(ZBULLETS);
            zCounter++;
        }
        
        else if (zDirection==='left'){
            zerg.moveLeft();
            zerg.fire(ZBULLETS);
            zCounter--;
        }
    }  
};

//--OK пуля зерга
let zbullet = {
    
    //--OK создание пули
    // пуля должна генериться после каждого смещения зерга
    // в качестве параметра можно задать число 1-2-3-4-5 - количество пуль в залпе (по умолчанию: 1)
    generate: function(n=1){
        
        for (n; n>0; n--){
            
            // считывание текущего зерга с поля
            let zerg = document.querySelectorAll('.zerg');

            // генерация рандомного целого числа из количества зергов
            let min = 0;
            let max = zerg.length-1;
            let rand = min + Math.random() * (max + 1 - min);
            rand = Math.floor(rand);

            // принятие рандомного зерга за стрелка
            let shooter = zerg[rand];
            let coordShooter = shooter.id.split('-');
            let x = +coordShooter[0];
            let y = +coordShooter[1];

            // поиск ближайего свободного места ниже для отрисовки пули зерга
            let nextBlock = document.getElementById(''+x+'-'+(++y)+'');
            
            //не стрелять, если следующий блок за границей поля
            if(nextBlock !== null){
                
            while (!nextBlock.classList.contains('empty')){
                y++;
                nextBlock = document.getElementById(''+x+'-'+y+'');
            }

            let zbullet = nextBlock;
            zbullet.classList.toggle('zbullet'); // вкл
            zbullet.classList.toggle('empty'); // откл
                
            }
        }
    },
    
    //--OK полет пули зерга с проверкой на попадание
    move: function(){
        
        //выбираем все пули зерга и смещаем каждую на один блок вниз
        let zbullets = document.querySelectorAll('.zbullet');
        
        for (let i = 0; i < zbullets.length; i++){
            let zbullet = zbullets[i];
            let coordzBullet = zbullet.id.split('-');
            let x = +coordzBullet[0];
            let y = +coordzBullet[1];
            let nextBlock = document.getElementById(''+x+'-'+(y+1)+'');
            
            //следующий блок null (за пределами поля)
            if (nextBlock === null){
                zbullet.classList.toggle('empty'); //вкл
                zbullet.classList.toggle('zbullet'); //откл
            } 
            //следующий блок имеет класс empty
            else if (nextBlock.classList.contains('empty')){
                zbullet.classList.toggle('empty'); //вкл
                zbullet.classList.toggle('zbullet'); //откл
                nextBlock.classList.toggle('zbullet'); //вкл
                nextBlock.classList.toggle('empty'); //откл
            }
            //следующий блок имеет класс ship
            else if (nextBlock.classList.contains('ship')){
                //удаление попавшей пули
                zbullet.classList.toggle('empty'); //вкл
                zbullet.classList.toggle('zbullet'); //откл
                
                //переход на ветку game over
                game.over();
            }
        }
    }
};

//--OK события игры
let game = {
    
    //--OK - начальная заставка
    welcome: function() {
        game.pause();
        
        scoreValue = 0;
        levelValue = 0;
        
        ui.generateCore();
        ui.generateButtonNewGame();
        field.generate(FIELD_WIDTH,FIELD_HEIGHT);
        zerg.generate(level.gameNew);
    },
    
    //--OK - запуск игры с экрана начальной заставки или экрана game over (кнопка Start)
    new: function() {
        scoreValue = 0;
        levelValue = 1;
        retry = 3;
        zCounter = 0;
        zDirection = 'right';
        
        ui.generateScore();
        ui.generateLives();
        ui.generateLevel(levelValue);
        ui.generateButtonPause();
        field.generate(FIELD_WIDTH,FIELD_HEIGHT);
        anchor.toggleDefault();
        ship.drawOrErase();
        zerg.generate(level['l_'+levelValue]);
        
        game.unPause();  
    },
    
    //--OK - пауза игры с сохранением прогресса
    pause: function() {
        // отключение обработчика событий управления и интервалов движения
        clearInterval(I1);
        clearInterval(I2);
        clearInterval(I3);
        document.removeEventListener('keydown', controls);
        document.removeEventListener('click', controlSensor);
    },
    
    //--OK - возобновление игры из паузы, старт анимаций
    unPause: function() {
        // включение обработчика событий управления и интервалов движения
        document.addEventListener('keydown', controls);
        document.addEventListener('click', controlSensor);
        I1 = setInterval(bullet.move, BULLET_SPEED); 
        I2 = setInterval(zbullet.move, ZBULLET_SPEED);
        I3 = setInterval(zerg.trajectory, Z_SPEED);
    },
    
    //--OK - запуск следующего уровня
    nextLevel: function() {
        levelValue++;
        zCounter = 0;
        zDirection = 'right';
        
        ui.generateButtonPause();
        ui.generateLevel(levelValue);
        field.generate(FIELD_WIDTH,FIELD_HEIGHT);
        anchor.toggleDefault();
        ship.drawOrErase();
        zerg.generate(level['l_'+levelValue]);
        
        game.unPause();
    },
    
    //--OK - запуск текущего уровня заново
    retry: function(){
        zCounter = 0;
        zDirection = 'right';
        
        ui.generateButtonPause();
        ui.generateLevel(levelValue);
        field.generate(FIELD_WIDTH,FIELD_HEIGHT);
        anchor.toggleDefault();
        ship.drawOrErase();
        zerg.generate(level['l_'+levelValue]);
        
        game.unPause();
    },
    
    //--OK - заставка game_over если попыток больше нет или game_retry если попытки еще есть
    over: function() {
        if (retry > 0){
            game.pause();
            ui.generateButtonRetry();
            field.generate(FIELD_WIDTH,FIELD_HEIGHT);
            zerg.generate(level.gameRetry);
            retry--;
        }
        else{
            game.pause();
            ui.generateButtonNewGame();
            field.generate(FIELD_WIDTH,FIELD_HEIGHT);
            zerg.generate(level.gameOver);
        } 
    },
    
    //--OK - победа в текущем уровне или в игре, если уровень последний
    win: function() {
        
        if (levelValue < MAX_LEVEL){
            game.winLevel();
            }
        
        else if (levelValue === MAX_LEVEL){
            game.winGame();
            }
    },
    
    //--OK - если уровень не последний
    winLevel: function(){
        game.pause();
        ui.generateButtonNextLevel();
        field.generate(FIELD_WIDTH,FIELD_HEIGHT);
        zerg.generate(level.levelWin);
    },
    
    //--OK - если уровень последний
    winGame: function(){
        game.pause();
        ui.generateButtonNewGame();
        field.generate(FIELD_WIDTH,FIELD_HEIGHT);
        zerg.generate(level.gameWin);
    }
};

//--OK реакция на нажатие сенсорных кнопок

function controlSensor(key){

    switch (key.srcElement.id) {
        case 'btn-left': // Сенсорная кнопка влево
            ship.moveLeft();
            break;
        case 'btn-right': // Сенсорная кнопка вправо
            ship.moveRight();
            break;
        case 'btn-space': // Сенсорная кнопка пробел
            ship.fire();
            break;        
    }
}

//--OK реакция на нажатие кнопок
function controls(key) {
    
	switch (key.keyCode) {
        case 37: // Клавиша влево
            ship.moveLeft();
            break;
        case 39: // Клавиша вправо
            ship.moveRight();
            break;
        case 32: // Клавиша пробел
            ship.fire();
            break;        
    }
}

export { game };