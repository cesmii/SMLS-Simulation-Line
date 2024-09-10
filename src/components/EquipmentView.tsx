import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Typography, TextField, Button, Stack, Container } from '@mui/material';
import { TreeView } from '@mui/x-tree-view';
import { ExpandMoreOutlined, ChevronRightOutlined } from '@mui/icons-material';
import EquipmentTreeItem from './EquipmentTreeItem';

const GET_EQUIPMENT_BY_ID = gql`
  query EquipmentByIdQuery($id: BigInt!) {
    equipment (id: $id) {
        id
        description
        displayName       
    }
  }`;

export interface EquipmentViewProps {
    equipmentId?: number;
}

function EquipmentView({ equipmentId }: EquipmentViewProps) {        
  const [id, setId] = useState<number | undefined>(equipmentId);
  const [inputValue, setInputValue] = useState<string>("");
  const { loading, error, data } = useQuery(GET_EQUIPMENT_BY_ID, { variables: { id: id }, skip: !id });  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :{error.message}</p>;

  if (!id || data.equipment === null) {
    return (
        <div className="EquipmentView">
            <Stack spacing={2} alignItems={'center'} marginTop={5}>
                <Typography variant="h4" component="h4">
                    Enter an Equipment ID to view
                </Typography>
                <TextField id="equipmentId" label="Equipment ID" variant="outlined" required={true} value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    error = { data?.equipment === null }
                    helperText={ data?.equipment === null ? 'Invalid Equipment ID' : '' } />                 
                <Button variant="contained" onClick={() => setId(Number(inputValue))}>View</Button>
            </Stack>
        </div>
    );
  }    

  return (
    <div className="EquipmentView">
        <Stack spacing={2} alignItems={'center'} marginTop={5}>
            <Typography variant="h4" component="h4">
                { data.equipment.displayName }
            </Typography>               
            <Container maxWidth='sm' sx={{ textAlign: 'left' }}>        
                <TreeView
                    defaultCollapseIcon={<ExpandMoreOutlined />}
                    defaultExpandIcon={<ChevronRightOutlined />}
                    defaultExpanded={[data.equipment.id]}
                >
                    <EquipmentTreeItem key={data.equipment.id} equipmentId={data.equipment.id} />
                </TreeView>            
            </Container>
        </Stack>
    </div>
  );
}

export default EquipmentView;
