SEE TOOTAB 

let tasks = [];
let lastTaskId; // see oli siia v'lja tootdud sest muidu ei olnud see muutuja k2ttesaadav
let bearerToken =""
let firstTaskId;

//-------SISSELOGIMINE ja Tokeni saamine ---------//
// HTML: onclick login()
function login(){ 
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    axios.post('http://demo2.z-bit.ee/users/get-token', {
        username:username,
        password:password
    })
    .then(response => {
        bearerToken = response.data.access_token;
        console.log(bearerToken);
        alert('Logged in Successfully')
        document.getElementById('login-section').style.display = 'none';
        
        getSetTasks(); 
        
    }).catch(error=> {
        console.error('Error Logging in', error)
        alert('failed to login'); // siia v6iks panna reaalse serverierrori. 
    })
        //tee leht taskide t;;tluseks valmis
        initializeTasks()
}
//SEE SAAB SERVERIS OLEVAD TASKID PEALE SISSELOGIMIST JA TOPIB NEED KOHALIKKU TASKLISTI
async function getSetTasks(){
    axios.get('http://demo2.z-bit.ee/tasks',{headers:{'Authorization': `Bearer ${bearerToken}`}})        
            
    .then(response => 
        {
        tasks = response.data;
        tasks.forEach(task => {
            const {id, title, desc, marked_as_done, created_at} = task
            renderTask(task);})  //etteantud func mis paneb taskid lehele. 
        
        firstTaskId=tasks[0].id;
        lastTaskId=tasks[tasks.length-1].id
        console.log("see on serverist saadud taskide array peale logimist", tasks)
        console.log(firstTaskId);
        console.log(lastTaskId);
//------------------------------------------------
        updateCheckedStatusFromServer();
//------------------------------------------------
        return tasks, lastTaskId;
        }
    );
}

//--------------------ADD 23.10. 22:51
async function updateCheckedStatusFromServer() {
    // Get the latest tasks from the server
    const response = await axios.get('http://demo2.z-bit.ee/tasks', {headers:{'Authorization': `Bearer ${bearerToken}`}});
    const fetchedTasks = response.data;

    // Update each task's checked status based on the server data
    for (const task of fetchedTasks) {
        const { id, marked_as_done } = task;

        // Find the checkbox corresponding to this task
        const checkbox = document.querySelector(`[data-task-id="${id}"] .ant-checkbox-input`);

        if (checkbox) {
            checkbox.checked = marked_as_done;
            
            // Update the visual appearance of the checkbox if necessary
            const wrapper = checkbox.closest('.ant-checkbox-wrapper');
            const antCheckbox = wrapper.querySelector('.ant-checkbox');
            if (marked_as_done) {
                antCheckbox.classList.add('ant-checkbox-checked');
            } else {
                antCheckbox.classList.remove('ant-checkbox-checked');
            }
        }
    }
}

let taskList;
let addTask;
function initializeTasks(){
    taskList = document.querySelector('#task-list');
    addTask = document.querySelector('#add-task');

    tasks.forEach(renderTask);
    
// viidud onclick addnewtas funktsiooni. Muidu tekkis topeltklikk ja porno
    // addTask.addEventListener('click', () => {
    //     const task = createTask(); // Teeme kõigepealt lokaalsesse /*const !!!!muutsin letiks*/* "andmebaasi" uue taski
    //     const taskRow = createTaskRow(task); // Teeme uue taski HTML elementi mille saaks lehe peale listi lisada
    //     taskList.appendChild(taskRow); // Lisame taski lehele
    // });

};

//Tee uus task ja saada see serverisse
//!!!!! HTML: btn add task: onclick=AddNewTask s
async function addNewTask(){
        
    //addTask.addEventListener('click', () => {
        const task = createTask(); // Teeme kõigepealt lokaalsesse /
        const taskRow = createTaskRow(task); // Teeme uue taski HTML elementi mille saaks lehe peale listi lisada
        taskList.appendChild(taskRow); // Lisame taski lehele

        lastTaskId++;
        await axios.post('http://demo2.z-bit.ee/tasks',
        {
            //Siin pole ID-d sest server paneb selle. 
            "title":'abracadabre'+lastTaskId,
            //siin on ID sest selle paneb kohalik func. 
            "desc":"bracadabre" + lastTaskId,
            "marked_as_done":false,  
            //"created_at":date //date is undefined
        },{headers:{'Authorization': `Bearer ${bearerToken}`}});
        
        axios.get('http://demo2.z-bit.ee/tasks',{headers:{'Authorization': `Bearer ${bearerToken}`}}
        )    
        .then(response => {
            tasks = response.data;
            tasks.forEach(task => {
                const {id, title, desc, marked_as_done, created_at} = task
            })
            tasks.forEach(task => {
                console.log(`"see on tasklist peale uue taski lisamist, yhtlasi kehtiv tasklist", ${task.id},${task.title}`)
            });
        });
}

//see in miongi asi mis lehele taske paneb
function renderTask(task) {
    const taskRow = createTaskRow(task);
    taskList.appendChild(taskRow);
}
//see on mingi etteantud bs mille taski parameetrid ei l'he kokku nendega mis on serveris. 
function createTask() {
    //lastTaskId++; // PANEN SELLE addNewtask serverifunktsioonile
    const task = {
        id: lastTaskId,
        name: 'Task ' + lastTaskId,
        completed: false
    };
    tasks.push(task);
    return task;
}

function createTaskRow(task) {
    let taskRow = document.querySelector('[data-template="task-row"]').cloneNode(true);
    taskRow.removeAttribute('data-template');

    // Täidame vormi väljad andmetega
    const name = taskRow.querySelector("[name='name']");
    name.innerText = task.name;

    const checkbox = taskRow.querySelector("[name='completed']");
    checkbox.checked = task.completed;

    const deleteButton = taskRow.querySelector('.delete-task');
    deleteButton.addEventListener('click', () => {
        taskList.removeChild(taskRow);
        tasks.splice(tasks.indexOf(task), 1);

//------KUSTUTAMINE-----KUSTUTAMINE KUSTUTAMINE KUSTUTAMINE Listist
    axios.delete(`http://demo2.z-bit.ee/tasks/${task.id}`,{headers:{'Authorization':'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY'}})
    console.log(task.id)
    });

    // Valmistame checkboxi ette vajutamiseks
    hydrateAntCheckboxes(taskRow);
    return taskRow;
}


function createAntCheckbox() {
    const checkbox = document.querySelector('[data-template="ant-checkbox"]').cloneNode(true);
    checkbox.removeAttribute('data-template');
    hydrateAntCheckboxes(checkbox);
    return checkbox;
}

function hydrateAntCheckboxes(element) {
    const elements = element.querySelectorAll('.ant-checkbox-wrapper');

    for (let i = 0; i < elements.length; i++) {
        let wrapper = elements[i];
        wrapper.setAttribute('data-task-id', tasks[i].id);

        // If the element has already been processed, skip it
        if (wrapper.__hydrated)
            continue;
        wrapper.__hydrated = true;

        const checkbox = wrapper.querySelector('.ant-checkbox');
        const input = wrapper.querySelector('.ant-checkbox-input');

        // Set the initial state of the checkbox based on server data
        input.checked = tasks[i].done; 

        // Update the visual appearance based on the checked state

        if (input.checked) {
            checkbox.classList.add('ant-checkbox-checked');
        } else {
            checkbox.classList.remove('ant-checkbox-checked');
        }

        // if (input.checked) {
        //     checkbox.classList.add('ant-checkbox-checked');
        // }
        
        // Toggle the checked state and visual appearance when the wrapper is clicked
        wrapper.addEventListener('click', () => {
            input.checked = !input.checked;
            checkbox.classList.toggle('ant-checkbox-checked');
        });
    }
}

document.getElementById('task-list').addEventListener('click', function(event) {
    // Check if the clicked element is a checkbox
    if (event.target.type === 'checkbox' ) {
        // Toggle the checkbox's checked state
        event.target.checked = !event.target.checked;
        
        // Determine the task id. 
        // Note: This assumes that each task has a unique id attribute or some other way to identify it.
        const taskId = event.target.closest('.ant-checkbox-wrapper').getAttribute('data-task-id'); // You'll need to fetch the task's ID somehow

        // Send the new marked_as_done status to the server
        axios.put(`http://demo2.z-bit.ee/tasks/${taskId}`, {
            "marked_as_done": event.target.checked
        }, {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            }
        })
        .then(response => {
            console.log('Update successful:', response.data);
        })
        .catch(error => {
            console.error('Update failed:', error);
        });
    }
});

// function hydrateAntCheckboxes(element) {
//     const elements = element.querySelectorAll('.ant-checkbox-wrapper');
//     let input = element.querySelectorAll('.ant-checkbox-wrapper');
//     for (let i = 0; i < elements.length; i++) {
//         let wrapper = elements[i];
// //-------------------------------------------------- 23.10 22:52        
//         wrapper.setAttribute('data-task-id', tasks[i].id);
// //-------------------------------------------------- 23.10 22:52
//         // Kui element on juba töödeldud siis jäta vahele
//         if (wrapper.__hydrated)
//             continue;
//         wrapper.__hydrated = true;


//         const checkbox = wrapper.querySelector('.ant-checkbox');

//         // Kontrollime kas checkbox peaks juba olema checked, see on ainult erikujundusega checkboxi jaoks
//         const input = wrapper.querySelector('.ant-checkbox-input');
//         if (input.checked) {
//             checkbox.classList.add('ant-checkbox-checked');
//         }
        
//         // Kui checkboxi või label'i peale vajutatakse siis muudetakse checkboxi olekut
//         wrapper.addEventListener('click', () => {
//             input.checked = !input.checked;
//             checkbox.classList.toggle('ant-checkbox-checked');
//         });
//     }
// }
// /**
//  * See funktsioon aitab lisada eridisainiga checkboxile vajalikud event listenerid
//  * @param {HTMLElement} element Checkboxi wrapper element või konteiner element mis sisaldab mitut checkboxi
//  */
// // function hydrateAntCheckboxes(element) {
// //     const elements = element.querySelectorAll('.ant-checkbox-wrapper');
// //     for (let i = 0; i < elements.length; i++) {
// //         let wrapper = elements[i];
// //         const taskId = tasks[i].id; // see sai lisatud
        
// //         // Kui element on juba töödeldud siis jäta vahele
// //         if (wrapper.__hydrated)
// //             continue;
// //         wrapper.__hydrated = true;
        

// //         const checkbox = wrapper.querySelector('.ant-checkbox');

// //         // Kontrollime kas checkbox peaks juba olema checked, see on ainult erikujundusega checkboxi jaoks
// //         const input = wrapper.querySelector('.ant-checkbox-input');
// //         if (input.checked) {
// //             checkbox.classList.add('ant-checkbox-checked');

// //             const taskStatus = input.checked; // see sai lisatud
// //             axios.put(`http://demo2.z-bit.ee/tasks/${taskId}`, {
// //                 "marked_as_done": taskStatus
// //             }, {
// //                 headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
// //             });
// //         }
        
// //         // Kui checkboxi või label'i peale vajutatakse siis muudetakse checkboxi olekut
// //         wrapper.addEventListener('click', () => {
// //             input.checked = !input.checked;
// //             checkbox.classList.toggle('ant-checkbox-checked');

// //             const taskId = tasks[i].id;
// //             console.log(`Checkbox with task id ${taskId} clicked`);
// //             const taskStatus = input.checked;
            
// //             axios.put(`http://demo2.z-bit.ee/tasks/${taskId}`, {
// //             "marked_as_done": taskStatus
// //             }, {
// //             headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
// //             });
// //             console.log("hydrateAntCheckboxes called");
// //         });
// //     }
// // }

// function hydrateAntCheckboxes(element) {
// //hydrate ant checkboxi kutsutakse v'lja 2 korda 

//     const elements = element.querySelectorAll('.ant-checkbox-wrapper');
//     for (let i = 0; i < elements.length; i++) {
//         let wrapper = elements[i];
//         const taskId = tasks[i].id; // directly capture taskId here

//         if (wrapper.__hydrated)
//             continue;
//         wrapper.__hydrated = true;

//         const checkbox = wrapper.querySelector('.ant-checkbox');
//         const input = wrapper.querySelector('.ant-checkbox-input');

//         if (input.checked) {
//             checkbox.classList.add('ant-checkbox-checked');
//             axios.put(`http://demo2.z-bit.ee/tasks/${taskId}`, {
//                 "marked_as_done": true
//             }, {
//                 headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
//             });
//         }

//         wrapper.addEventListener('click', (event) => {
//             if (event.target !== input) { // check if the clicked element is not the actual checkbox
//                 input.checked = !input.checked;
//             }

//             checkbox.classList.toggle('ant-checkbox-checked', input.checked);
//             console.log(`Checkbox with task id ${taskId} clicked`); // use directly captured taskId

//             axios.put(`http://demo2.z-bit.ee/tasks/${taskId}`, {
//                 "marked_as_done": input.checked
//             }, {
//                 headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
//             });
//             console.log("hydrateAntCheckboxes called");
//         });
//     }
// }

// let newTaskArray = [];
// let newTask

// //////----------see asi v]tab uuesti sisse kehtivad taskid selleks et vaadata selle checkboxide staatust hiljem. 
// function newTaskListForCheckboxes(){
// axios.get('http://demo2.z-bit.ee/tasks',{headers:{'Authorization': `Bearer ${bearerToken}`}}

// )    
// .then(response => {
//     newTasks = response.data;
//     newTasks.forEach(newTask => {
//         const {id, marked_as_done} = newTask
//         newTaskArray.push({id,marked_as_done})
//     })
//     console.log("this is new task array", newTaskArray)
// });
// //////----------see asi n'itab kas arraysse j6uavad 6iged asjad. J]uavad, aga 2korda. siis epaks selle kuskile row v6i checkbox creationi viima l6puks. 
// }
// function appendTaskIdsToAntListItems(){
// //ANT list itemeid on 1 per task HTML-is. Mingeid muid asju oli nt 5 per 3 taski
// //See func paneb uue atribuudi html elemendile, kus on ant-lis-item. Nii seon task ID-d konkreetse html elemendiga. 
//     const antListItems = document.querySelectorAll('.ant-list-item');
//     for (let i=0;i<antListItems.length; i++){
//         antListItems[i].setAttribute('data-task-id',newTaskArray[i].id)
//     }
// }

// // function hydrateAntCheckboxes(element) {
// //     const elements = Array.from(element.querySelectorAll('.ant-checkbox-wrapper')); // Convert NodeList to Array
// //     elements.forEach((wrapper, i) => {  // Use forEach loop
// //         const taskId = tasks[i].id;

// //         if (wrapper.__hydrated)
// //             continue;
// //         wrapper.__hydrated = true;

// //         const checkbox = wrapper.querySelector('.ant-checkbox');
// //         const input = wrapper.querySelector('.ant-checkbox-input');

// //         if (input.checked) {
// //             checkbox.classList.add('ant-checkbox-checked');
// //             axios.put(`http://demo2.z-bit.ee/tasks/${taskId}`, {
// //                 "marked_as_done": true
// //             }, {
// //                 headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
// //             });
// //         }

// //         wrapper.addEventListener('click', (event) => {
// //             if (event.target !== input) { // check if the clicked element is not the actual checkbox
// //                 input.checked = !input.checked;
// //             }

// //             checkbox.classList.toggle('ant-checkbox-checked', input.checked);
// //             console.log(`Checkbox with task id ${taskId} clicked`); // use directly captured taskId

// //             axios.put(`http://demo2.z-bit.ee/tasks/${taskId}`, {
// //                 "marked_as_done": input.checked
// //             }, {
// //                 headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
// //             });
// //             console.log("hydrateAntCheckboxes called");
// //         });
// //     });
// // }

// // function hydrateAntCheckboxes(element) {
// //     const elements = Array.from(element.querySelectorAll('.ant-checkbox-wrapper')); // Convert NodeList to Array
// //     elements.forEach((wrapper, i) => {  // Use forEach loop
// //         const taskId = tasks[i].id;
        
// //         if (wrapper.__hydrated)
// //             return;  // Use return instead of continue
// //         wrapper.__hydrated = true;

// //         const checkbox = wrapper.querySelector('.ant-checkbox');
// //         const input = wrapper.querySelector('.ant-checkbox-input');

// //         if (input.checked) {
// //             checkbox.classList.add('ant-checkbox-checked');
// //             axios.put(`http://demo2.z-bit.ee/tasks/${taskId}`, {
// //                 "marked_as_done": true
// //             }, {
// //                 headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
// //             });
// //         }

// //         wrapper.addEventListener('click', (event) => {
// //             if (event.target !== input) { // check if the clicked element is not the actual checkbox
// //                 input.checked = !input.checked;
// //             }

// //             checkbox.classList.toggle('ant-checkbox-checked', input.checked);
// //             console.log(`Checkbox with task id ${taskId} clicked`); // use directly captured taskId

// //             axios.put(`http://demo2.z-bit.ee/tasks/${taskId}`, {
// //                 "marked_as_done": input.checked
// //             }, {
// //                 headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
// //             });
// //             console.log("hydrateAntCheckboxes called");
// //             console.log(`Processing task with id ${taskId}`);
// //         });
// //     });
// // }

// // function hydrateAntCheckboxes(element) {
// //     const elements = [...element.querySelectorAll('.ant-checkbox-wrapper')];

// //     elements.forEach((wrapper, index) => {
// //         const taskId = tasks[index].id;

// //         // Check if element has already been processed
// //         if (wrapper.__hydrated) return;
// //         wrapper.__hydrated = true;

// //         const checkbox = wrapper.querySelector('.ant-checkbox');
// //         const input = wrapper.querySelector('.ant-checkbox-input');

// //         // If the checkbox should be checked based on data
// //         if (input.checked) {
// //             checkbox.classList.add('ant-checkbox-checked');
// //             axios.put(`http://demo2.z-bit.ee/tasks/${taskId}`, {
// //                 "marked_as_done": input.checked
// //             }, {
// //                 headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
// //             });
// //         }

// //         // Handle checkbox click
// //         wrapper.addEventListener('click', () => {
// //             checkbox.classList.toggle('ant-checkbox-checked');
// //             console.log(`Checkbox with task id ${taskId} clicked`);

// //             axios.put(`http://demo2.z-bit.ee/tasks/${taskId}`, {
// //                 "marked_as_done": input.checked
// //             }, {
// //                 headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
// //             });
// //         });
// //     });
// // }
// // function hydrateAntCheckboxes(element) {
// //     const elements = [...element.querySelectorAll('.ant-checkbox-wrapper')];

// //     elements.forEach((wrapper, index) => {
// //         const taskId = tasks[index].id;

// //         // Assign taskId as a data attribute to the wrapper
// //         wrapper.setAttribute('data-task-id', taskId);

// //         // Check if element has already been processed
// //         if (wrapper.__hydrated) return;
// //         wrapper.__hydrated = true;

// //         const checkbox = wrapper.querySelector('.ant-checkbox');
// //         const input = wrapper.querySelector('.ant-checkbox-input');

// //         // If the checkbox should be checked based on data
// //         if (input.checked) {
// //             checkbox.classList.add('ant-checkbox-checked');
// //             axios.put(`http://demo2.z-bit.ee/tasks/${taskId}`, {
// //                 "marked_as_done": input.checked
// //             }, {
// //                 headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
// //             });
// //         }

// //         // Handle checkbox click
// //         wrapper.addEventListener('click', (event) => {
// //             const clickedTaskId = event.currentTarget.getAttribute('data-task-id');
// //             checkbox.classList.toggle('ant-checkbox-checked');
// //             console.log(`Checkbox with task id ${clickedTaskId} clicked`);

// //             axios.put(`http://demo2.z-bit.ee/tasks/${clickedTaskId}`, {
// //                 "marked_as_done": input.checked
// //             }, {
// //                 headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
// //             });
// //         });
// //     });
// // }

// // function hydrateAntCheckboxes(element) {
// //     // Fetch the list of items from the server
// //     axios.get('http://demo2.z-bit.ee/tasks', {
// //         headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
// //     }).then(response => {
// //         const itemList = response.data;

// //         const elements = [...element.querySelectorAll('.ant-checkbox-wrapper')];

// //         elements.forEach((wrapper, index) => {
// //             const itemID = itemList[index].id;

// //             // Assign itemID as a data attribute to the wrapper
// //             wrapper.setAttribute('data-item-id', itemID);

// //             // Check if element has already been processed
// //             if (wrapper.__hydrated) return;
// //             wrapper.__hydrated = true;

// //             const checkbox = wrapper.querySelector('.ant-checkbox');
// //             const input = wrapper.querySelector('.ant-checkbox-input');

// //             // If the checkbox should be checked based on data
// //             if (input.checked) {
// //                 checkbox.classList.add('ant-checkbox-checked');
// //                 axios.put(`http://demo2.z-bit.ee/tasks/${itemID}`, {
// //                     "marked_as_done": input.checked
// //                 }, {
// //                     headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
// //                 });
// //             }

// //             // Handle checkbox click
// //             wrapper.addEventListener('click', (event) => {
// //                 const clickedItemID = event.currentTarget.getAttribute('data-item-id');
// //                 checkbox.classList.toggle('ant-checkbox-checked');
// //                 console.log(`Checkbox with item id ${clickedItemID} clicked`);

// //                 axios.put(`http://demo2.z-bit.ee/tasks/${clickedItemID}`, {
// //                     "marked_as_done": input.checked
// //                 }, {
// //                     headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
// //                 });
// //             });
// //         });
// //     }).catch(error => {
// //         console.error("Error fetching item list:", error);
// //     });
// // }