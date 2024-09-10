import { useQuery, gql } from '@apollo/client';
import { TreeItem } from '@mui/x-tree-view';
import AttributeTreeItem from './AttributeTreeItem';
import { useState } from 'react';

const GET_EQUIPMENT_BY_ID = gql`
  query EquipmentByIdQuery($id: BigInt!, $startTime: Datetime!, $endTime: Datetime!) {
    equipment (id: $id) {
        id
        fqn
        description
        displayName
        typeName
        typeId
        childEquipment {
          id
        }
        attributes {
          id
          displayName
          dataType
          dataSource
          fqn
          getTimeSeries (startTime: $startTime, endTime: $endTime) {
            ts
            floatvalue
            boolvalue
            intvalue
            objectvalue
            datetimevalue
            stringvalue
          }
      }
    }
  }`;

export interface EquipmentTreeItemProps {
    equipmentId: number;
}

function EquipmentTreeItem({ equipmentId }: EquipmentTreeItemProps) {          
    const [startTime, setStartTime] = useState<string>(new Date(Date.now() - 3000).toISOString());
    const [endTime, setEndTime] = useState<string>(new Date(Date.now()).toISOString());
    const { loading, error, data } = useQuery(GET_EQUIPMENT_BY_ID, 
        {
            variables: { 
                id: equipmentId,
                startTime: startTime,
                endTime: endTime
            }        
        }
    );    

    return (
        <TreeItem nodeId={equipmentId.toString()} label={ loading ? 'Loading...' : error ? error.message : data.equipment.displayName } >                
            {                        

                !loading && !error && data.equipment.childEquipment.map((child: any) => {
                    return <EquipmentTreeItem key={child.id} equipmentId={child.id} />
                })    
            }
            {
                !loading && !error && data.equipment.attributes.map((attribute: any) => {                 
                    return <AttributeTreeItem key={attribute.id} id={attribute.id} displayName={attribute.displayName} dataType={attribute.dataType} dataSource={attribute.dataSource} fqn={attribute.fqn} samples={attribute.getTimeSeries} />
                })
            }
        </TreeItem>
    );
}

export default EquipmentTreeItem;
