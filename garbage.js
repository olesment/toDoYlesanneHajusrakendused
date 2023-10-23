elements.forEach((wrapper, i) => {  // Use forEach loop
    function hydrateAntCheckboxes(element) {
        //hydrate ant checkboxi kutsutakse v'lja 2 korda 
        
        //////----------see asi n'itab kas arraysse j6uavad 6iged asjad. 
            axios.get('http://demo2.z-bit.ee/tasks',{headers:{'Authorization': `Bearer ${bearerToken}`}}
        
            )    
            .then(response => {
                newTasks = response.data;
                newTasks.forEach(newTask => {
                    const {id, marked_as_done} = newTask
                    newTaskArray.push({id,marked_as_done})
                })
                console.log("this is new task array", newTaskArray)
            });
        //////----------see asi n'itab kas arraysse j6uavad 6iged asjad. J]uavad, aga 2korda. siis epaks selle kuskile row v6i checkbox creationi viima l6puks. 
        
            const elements = element.querySelectorAll('.ant-checkbox-wrapper');
            for (let i = 0; i < elements.length; i++) {
                let wrapper = elements[i];
                const taskId = tasks[i].id; // directly capture taskId here
        
                if (wrapper.__hydrated)
                    continue;
                wrapper.__hydrated = true;
        
                const checkbox = wrapper.querySelector('.ant-checkbox');
                const input = wrapper.querySelector('.ant-checkbox-input');
        
                if (input.checked) {
                    checkbox.classList.add('ant-checkbox-checked');
                    axios.put(`http://demo2.z-bit.ee/tasks/${taskId}`, {
                        "marked_as_done": true
                    }, {
                        headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
                    });
                }
        
                wrapper.addEventListener('click', (event) => {
                    if (event.target !== input) { // check if the clicked element is not the actual checkbox
                        input.checked = !input.checked;
                    }
        
                    checkbox.classList.toggle('ant-checkbox-checked', input.checked);
                    console.log(`Checkbox with task id ${taskId} clicked`); // use directly captured taskId
        
                    axios.put(`http://demo2.z-bit.ee/tasks/${taskId}`, {
                        "marked_as_done": input.checked
                    }, {
                        headers: { 'Authorization': 'Bearer vzKGRA2XMoaZgM_YSyGsXTWUIk9BJriY' }
                    });
                    console.log("hydrateAntCheckboxes called");
                });
            }
        }
        