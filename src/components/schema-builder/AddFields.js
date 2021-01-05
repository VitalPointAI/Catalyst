import React, {useState} from 'react'
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List' 
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import TextFieldsTwoToneIcon from '@material-ui/icons/TextFieldsTwoTone'
import FormatListNumberedTwoToneIcon from '@material-ui/icons/FormatListNumberedTwoTone';
import CheckBoxTwoToneIcon from '@material-ui/icons/CheckBoxTwoTone';
import ImageTwoToneIcon from '@material-ui/icons/ImageTwoTone';

const toolStyle= {
    backgroundColor: "#0072CE",
    border: '2px solid',
    borderColor: '#24272a',
    minHeight: "100%",
    maxHeight: "100%"
}

const formStyle = {
    minWidth: "88%", 
    minHeight: "100%",
    maxHeight: '100%',
    overflow: 'auto'
}

const gridList = {
   margin: 'left',
   padding: '0px', 
   width: '100%',
}
const toolGridTile = {
    margin: 'left',
    minWidth: '10%',
    minHeight: '100%'
}
const formGridTile = {
    margin: 'left',
    minWidth: "80%",
    maxWidth: "80%",
    overflow: 'auto',
    maxHeight: '600px'
}
const ToolBarElements = [{
    id: "TextArea",
    name: "Text Area",
},
{
    id: "Number",
    name:"Number"
},
{
    id: "Checkbox",
    name: "Checkbox"
},
{
    id: "Image",
    name: "Image",
},
]
const formElements = [{
    id: "",
    name: ""
}]

export const personaSchema = {
    $id: 'https://example.com/post.schema.json',
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Persona',
    type: 'object',
    required: ['_id'],
    properties: {
      _id: {
        type: 'string',
      },
    },
}

function Toolbar() {
    const [tools, updateTools] = useState(ToolBarElements); 
    const [formItems, updateFormItems] = useState(formElements); 
    const schema = new Map()
    const keyValue = Math.random()
    const keyValue2 = Math.random()
   

    const _ = require('lodash');
    function handleOnDragEnd(result){
        if(!result.destination) return;
        if(result.source.droppableId == result.destination.droppableId){
            const items = Array.from(tools);
            const [reorderedItem] = items.splice(result.source.index, 1);
            items.splice(result.destination.index, 0 , reorderedItem);
             
            updateTools(items); 
        }
        else{
            const items = Array.from(tools);
            const fields = Array.from(formItems); 
            const [reorderedItem] = items.splice(result.source.index, 1);
            fields.push(reorderedItem); 

            updateFormItems(fields); 
        }
    }
    function handleChange(event){
        if(event.target.name.localeCompare("Text Area") == 0){
            
            schema.set(`${event.target.id}`, {name: _.camelCase(`${event.target.value}`), type: {type: "string"}})
        }
        else if(event.target.name.localeCompare("Number") == 0)
        {
            schema.set(`${event.target.id}`, {name: _.camelCase(`${event.target.value}`), type: {type: "number"}})
        }
        else if(event.target.name.localeCompare("Checkbox") == 0)
        {
            schema.set(`${event.target.id}`, {name: _.camelCase(`${event.target.value}`), type: {type: "boolean"}})
        }
        else if(event.target.name.localeCompare("Image") == 0)
        {
            schema.set(`${event.target.id}`, {name: _.camelCase(`${event.target.value}`), type: {type: "string", contentEncoding: "base64"}})
        }
    }
    function handleOnClick(){
        for(const [key, value] of schema.entries())
        {
            personaSchema.properties[`${value.name}`] = value.type
        }
        console.log(personaSchema)
        return(personaSchema)
    }

    /**RETURN THE FORM AND TOOLBAR */
    return(
        
        <GridList style={gridList}>
        <DragDropContext style={formStyle} onDragEnd={handleOnDragEnd}>
         
            <GridListTile style={toolGridTile}>
            <Droppable droppableId = "tools"> 
            {(provided) => (
            <List style={toolStyle}{...provided.droppableProps} ref = {provided.innerRef}>
                {tools.map(({id, name}, index) =>
                {
                    if(name.localeCompare("Text Area") == 0){
                    return(
                    <Draggable key={id} draggableId={id} index={index}>
                        {(provided) => (
                        <ListItem key={index} style={{backgroundColor: 'black', border: '1px solid'}} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <ListItemIcon>
                                <TextFieldsTwoToneIcon style={{color: 'white'}}/>
                            </ListItemIcon>
                            <ListItemText  style={{color: 'white'}} primary={`${name}`} />
                        </ListItem>
                        )}
                    </Draggable>
                    
                    );
                    }
                    else if(name.localeCompare("Number") == 0 ){
                        return(
                        <Draggable key={id} draggableId={id} index={index}>
                            {(provided) => (
                            <ListItem style={{backgroundColor: 'black'}} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                <ListItemIcon>
                                    <FormatListNumberedTwoToneIcon style={{color: 'white'}}/>
                                </ListItemIcon>
                                <ListItemText style={{color: 'white'}} primary={`${name}`} />
                            </ListItem>
                            )}
                        </Draggable>
                        
                        );
                        }
                        else if(name.localeCompare("Checkbox") == 0 ){
                            return(
                            <Draggable key={id} draggableId={id} index={index}>
                                {(provided) => (
                                <ListItem style={{backgroundColor: 'black'}} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                    <ListItemIcon>
                                        <CheckBoxTwoToneIcon style={{color: 'white'}}/>
                                    </ListItemIcon>
                                    <ListItemText style={{color: 'white'}} primary={`${name}`} />
                                </ListItem>
                                )}
                            </Draggable>
                            
                            );
                            }
                            else if(name.localeCompare("Image") == 0 ){
                                return(
                                <Draggable key={id} draggableId={id} index={index}>
                                    {(provided) => (
                                    <ListItem style={{backgroundColor: 'black'}} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                        <ListItemIcon>
                                            <ImageTwoToneIcon style={{color: 'white'}}/>
                                        </ListItemIcon>
                                        <ListItemText style={{color: 'white'}} primary={`${name}`} />
                                    </ListItem>
                                    )}
                                </Draggable>
                                
                                );
                                }
                })}  
                {provided.placeholder}
            </List>
        )}
        </Droppable> 
        </GridListTile>
        <GridListTile style={formGridTile}>
        <Droppable style={formStyle} droppableId = "form">
            {(provided) => (
            <Paper  style={formStyle} className = "form" {...provided.droppableProps} ref = {provided.innerRef}>
                <h2>Drag Fields Here</h2>
                <form style={formStyle}>
                {formItems.map(({id, name}, index) =>{
                    
                    if(id.localeCompare("TextArea") == 0)
                    {
                        id = Math.random()
                        return(
                            <>
                            <ListItem key = {keyValue} ><h3>{name}</h3></ListItem>
                            <ListItem key={keyValue2}>
                            <ListItemIcon><TextFieldsTwoToneIcon /></ListItemIcon>
                            <TextField helperText="Enter Field Name" id={`${index}`} name={name} onChange={handleChange}> </TextField>
                            </ListItem>
                            </>
                        )
                    }
                 
                    else if(id.localeCompare("Number") == 0)
                    {
                        id = Math.random()
                        return(
                            <>
                            <ListItem key={keyValue}><h3>{name}</h3></ListItem>
                            <ListItem key={keyValue2}>
                                <ListItemIcon><FormatListNumberedTwoToneIcon /></ListItemIcon>
                            <TextField helperText="Enter Field Name" id={`${index}`} name = {name} onChange={handleChange}/>
                            </ListItem>
                            </>
                        )
                    }
                    
                    else if(id.localeCompare("Checkbox") == 0)
                    {
                        id = Math.random()
                        return(
                            <>
                            <ListItem key={keyValue}><h3>{name}</h3></ListItem>
                            <ListItem key={keyValue2}>
                            <ListItemIcon><CheckBoxTwoToneIcon /></ListItemIcon>
                            <TextField helperText="Enter Field Name" id={`${index}`} name = {name} onChange={handleChange}/>
                            </ListItem>
                            </>
                        )
                    }
                     
                    else if(id.localeCompare("Image") == 0)
                    {
                        id = Math.random()
                        return(
                            <>
                            <ListItem key={keyValue}><h3 style={{color: "gray"}}>{name}</h3></ListItem>
                            <ListItem key={keyValue2}>
                            <ListItemIcon><ImageTwoToneIcon/></ListItemIcon>
                            <TextField helperText="Enter Field Name" id={`${index}`} name = {name} onChange={handleChange}/>
                            </ListItem>
                            </>
                        )
                    }
                })}
                {provided.placeholder}
                <Button variant = "text" 
                variant = "outlined"
                size="large" 
                fullWidth={true} 
                style={{color:"#0072CE", justifyContent: "bottom"}}
                onClick = {handleOnClick}>
                    SUBMIT
                </Button>
                
                </form>
            </Paper>
            )}
        </Droppable>
        </GridListTile>
        </DragDropContext>
        </GridList>         
        
    )
}

export default Toolbar