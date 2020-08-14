import React, {useState, useEffect} from 'react';
import api from './Services/api';
import DevList from './Components/devList/index';
import DevForm from './Components/devForm';

import './Styles/Global.css';
import './Styles/App.css';
import './Styles/Sidebar.css';
import './Styles/Main.css';


export default function App() {

  const [listDevs, setListDevs] = useState([]);


  useEffect(() =>{
    async function loadDevs(){
      const response = await api.get('/devs');
      setListDevs(response.data);
    }
    loadDevs();
  },[]);

  async function handleAddDev(data){
    console.log('Data =>', data);
    const response = await api.post('/devs',data);
    
    setListDevs([...listDevs, response.data]);
  }


  return (
   <div id="app">
      <aside>
        <strong>Cadastrar</strong>
        <DevForm onSbmit ={handleAddDev}/>
      </aside>

      <main>
          <ul>
            {listDevs.map(d=>(
              <DevList key={d._id} dev = {d}/>
            ))}
          </ul>
      </main> 
  </div>
  );
}


