var FIELD_WIDTH = 25; // ширина поля 25x20px = 500px
var FIELD_HEIGHT = 32; // высота поля 32x20px = 640px

var MAX_LEVEL = 10; //всего уровней, для проверки на выигрыш

var SCORE_VALUE; // значение поля интерфейса score
var LEVEL_VALUE; // значение поля интерфейса level
var RETRY; // количество повторов в случае проигрыша

var BULLET_SPEED = 50; // интервал времени перемещения пули
var Z_SPEED = 1000; // интервал времени перемещения зерга
var ZBULLET_SPEED = 200; // интервал времени перемещения пули зергов

var ZBULLETS = 1; //количество выстрелов в залпе зерга

var ZCOUNTER = 0; // для реализации траектории зерга
var ZDIRECTION = 'right'; //для реализации траектории зерга

var I1; //переменная для сохранения интервала bullet
var I2; //переменная для сохранения интервала zbullet
var I3; //переменная для сохранения интервала trajectory


//--OK методы объекта гененируют различные части интерфейса
var interface = {
    
    //--OK первоначальная генерация всего интерфейса
    generateCore: function(){
        let interface = document.querySelector('.interface');
        interface.innerHTML = ''; //очистка содержимого блока

        let level = document.createElement('div');
        level.className = 'level';
        level.innerHTML = '<div class="text">Level:</div><div class="value">'+LEVEL_VALUE+'</div>';
        interface.appendChild(level);
        
        let score = document.createElement('div');
        score.className = 'score';
        score.innerHTML = '<div class="text">Score:</div><div class="value">'+SCORE_VALUE+'</div>';
        interface.appendChild(score);
        
        let button = document.createElement('div');
        button.className = 'button newGame';
        button.innerHTML = 'New Game';
        interface.appendChild(button);
        
    },
    
    //--OK перегенерация значения поля level по параметру x
    generateLevel: function(x){
        let level = document.querySelector('.level');
        level.innerHTML = '';
        level.innerHTML = '<div class="text">Level:</div><div class="value">'+x+'</div>';
    },
    
    //--OK перегенерация значения поля score
    generateScore: function(){
        let score = document.querySelector('.score');
        score.innerHTML = '';
        score.innerHTML = '<div class="text">Score:</div><div class="value">'+SCORE_VALUE+'</div>';
    },
    
    //--OK перегенерация кнопки New Game
    generateButtonNewGame: function(){
        let button = document.querySelector('.button');
        button.className = '';
        button.innerHTML = '';
        button.className = 'button newGame';
        button.innerHTML = 'New Game';
        
        button.onclick = function(){
            game.new();
        }
    },
    
    //--OK перегенерация кнопки Pause
    generateButtonPause: function(){
        let button = document.querySelector('.button');
        button.className = '';
        button.innerHTML = '';
        button.className = 'button pause';
        button.innerHTML = 'Pause';
        
        button.onclick = function(){
            game.pause();
            interface.generateButtonUnPause();
        }
    },
    
    //--OK перегенерация кнопки UnPause
    generateButtonUnPause: function(){
        let button = document.querySelector('.button');
        button.className = '';
        button.innerHTML = '';
        button.className = 'button unpause';
        button.innerHTML = 'UnPause';
        
        button.onclick = function(){
            game.unPause();
            interface.generateButtonPause();
        }
    },
    
    //--OK перегенерация кнопки Next level
    generateButtonNextLevel: function(){
        let button = document.querySelector('.button');
        button.className = '';
        button.innerHTML = '';
        button.className = 'button nextlevel';
        button.innerHTML = 'Next level';
        
        button.onclick = function(){
            game.nextLevel();
        }
    },
    
    //--OK перегенерация кнопки Retry
    generateButtonRetry: function(){
        let button = document.querySelector('.button');
        button.className = '';
        button.innerHTML = '';
        button.className = 'button retry';
        button.innerHTML = 'Retry ('+RETRY+')';
        
        button.onclick = function(){
            game.retry();
        }
    }
}

//--OK генерация игрового поля
var field = {
    
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
}

//--OK якорь - центральная точка для отрисовки корабля и его перемещения
var anchor = {
    
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
}

//--OK корабль
var ship = {
    
    //--OK отрисовка или удаление корабля от якоря
    drawOrErase: function(){
        let anchor = document.querySelector('.anchor');
        let coordAnchor = anchor.id.split('-');
        let x = +coordAnchor[0];
        let y = +coordAnchor[1];
        
//10 блоков для возможности различной отрисовки частей корабля
        
//                  10
//                 7 8 9
//                 4 5 6
//                 1 2 3
        
        let block1 = document.getElementById(''+(x-1)+'-'+y+'');
        
        let block2 = document.getElementById(''+x+'-'+y+'');
        block2.classList.toggle('empty'); // откл
        block2.classList.toggle('ship'); // вкл
        block2.classList.toggle('block2'); // вкл
        
        let block3 = document.getElementById(''+(x+1)+'-'+y+'');
        
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
        
        for (i = (shipArr.length-1); i >= 0; i--){
            if((shipArr[i].classList.contains('zerg')) ||
              (shipArr[i].classList.contains('zbullet'))){
                game.over();
               }
        }
    }
}

//--OK пуля корабля
var bullet = {
    
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
                SCORE_VALUE++;
                interface.generateScore();    
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
}

//--OK зерг
var zerg = {
    
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
        
        for (i = (zArr.length-1); i >= 0; i--){
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
        
        for (i = 0; i <= (zArr.length-1); i++){
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
        
        for (i = (zArr.length-1); i >= 0; i--){
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
        
        if (ZDIRECTION==='right' && ZCOUNTER===3){
            zerg.moveDown();
            zerg.fire(ZBULLETS);
            ZDIRECTION = 'left';
        }
        
        else if (ZDIRECTION==='left' && ZCOUNTER===-3){
            zerg.moveDown();
            zerg.fire(ZBULLETS);
            ZDIRECTION = 'right';
        }
        
        else if (ZDIRECTION==='right'){
            zerg.moveRight();
            zerg.fire(ZBULLETS);
            ZCOUNTER++;
        }
        
        else if (ZDIRECTION==='left'){
            zerg.moveLeft();
            zerg.fire(ZBULLETS);
            ZCOUNTER--;
        }
    }  
}

//--OK пуля зерга
var zbullet = {
    
    //--OK создание пули
    // пуля должна генериться после каждого смещения зерга
    // в качестве параметра можно задать число 1-2-3-4-5 - количество пуль в залпе (по умолчанию 1 пуля в залпе)
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
}

//--OK события игры
var game = {
    
    //--OK - начальная заставка
    welcome: function() {
        game.pause();
        
        SCORE_VALUE = 0;
        LEVEL_VALUE = 0;
        
        interface.generateCore();
        interface.generateButtonNewGame();
        field.generate(FIELD_WIDTH,FIELD_HEIGHT);
        zerg.generate(level.game_new);
    },
    
    //--OK - запуск игры с экрана начальной заставки или экрана game over (кнопка New Game)
    new: function() {
        SCORE_VALUE = 0;
        LEVEL_VALUE = 1;
        RETRY = 3;
        ZCOUNTER = 0;
        ZDIRECTION = 'right';
        
        interface.generateScore();
        interface.generateLevel(LEVEL_VALUE);
        interface.generateButtonPause();
        field.generate(FIELD_WIDTH,FIELD_HEIGHT);
        anchor.toggleDefault();
        ship.drawOrErase();
        zerg.generate(level['l_'+LEVEL_VALUE]);
        
        game.unPause();
        
    },
    
    //--OK - пауза игры с сохранением прогресса
    pause: function() {
        // отключение обработчика событий управления и интервалов движения
        clearInterval(I1);
        clearInterval(I2);
        clearInterval(I3);
        document.removeEventListener('keydown', controls);
    },
    
    //--OK - возобновление игры из паузы, старт анимаций
    unPause: function() {
        // включение обработчика событий управления и интервалов движения
        document.addEventListener('keydown', controls);
        I1 = setInterval(bullet.move, BULLET_SPEED); 
        I2 = setInterval(zbullet.move, ZBULLET_SPEED);
        I3 = setInterval(zerg.trajectory, Z_SPEED);
    },
    
    //--OK - запуск следующего уровня
    nextLevel: function() {
        LEVEL_VALUE++;
        ZCOUNTER = 0;
        ZDIRECTION = 'right';
        
        interface.generateButtonPause();
        interface.generateLevel(LEVEL_VALUE);
        field.generate(FIELD_WIDTH,FIELD_HEIGHT);
        anchor.toggleDefault();
        ship.drawOrErase();
        zerg.generate(level['l_'+LEVEL_VALUE]);
        
        game.unPause();
        
    },
    
    //--OK - запуск текущего уровня заново
    retry: function(){
        ZCOUNTER = 0;
        ZDIRECTION = 'right';
        
        interface.generateButtonPause();
        interface.generateLevel(LEVEL_VALUE);
        field.generate(FIELD_WIDTH,FIELD_HEIGHT);
        anchor.toggleDefault();
        ship.drawOrErase();
        zerg.generate(level['l_'+LEVEL_VALUE]);
        
        game.unPause();
    },
    
    //--OK - заставка game_over если попыток больше нет или game_retry если попытки еще есть
    over: function() {
        if (RETRY > 0){
            game.pause();
            interface.generateButtonRetry();
            field.generate(FIELD_WIDTH,FIELD_HEIGHT);
            zerg.generate(level.game_retry);
            RETRY--;
        }
        else{
            game.pause();
            interface.generateButtonNewGame();
            field.generate(FIELD_WIDTH,FIELD_HEIGHT);
            zerg.generate(level.game_over);
        } 
    },
    
    //--OK - победа в текущем уровне или в игре, если уровень последний
    win: function() {
        
        if (LEVEL_VALUE < MAX_LEVEL){
            game.winLevel();
            }
        
        else if (LEVEL_VALUE === MAX_LEVEL){
            game.winGame();
            }
    },
    
    //--OK - если уровень не последний
    winLevel: function(){
        game.pause();
        interface.generateButtonNextLevel();
        field.generate(FIELD_WIDTH,FIELD_HEIGHT);
        zerg.generate(level.level_win);
    },
    
    //--OK - если уровень последний
    winGame: function(){
        game.pause();
        interface.generateButtonNewGame();
        field.generate(FIELD_WIDTH,FIELD_HEIGHT);
        zerg.generate(level.game_win);
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


//запуск игры
game.welcome();
