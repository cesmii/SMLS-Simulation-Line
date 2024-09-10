import { gql, useQuery } from '@apollo/client';
import { TreeItem } from '@mui/x-tree-view';
import { useEffect, useState } from 'react';

const GET_ATTRIBUTE_VALUE_QUERY = gql`
  query AttributeValueQuery ($ids: [BigInt]!, $startTime: Datetime!, $endTime: Datetime!) {
    getRawHistoryDataWithSampling (ids: $ids, startTime: $startTime, endTime: $endTime, maxSamples: 1) {
      id
      ts
      intvalue
      boolvalue
      objectvalue
      datetimevalue
      floatvalue
      stringvalue
    }
  }
`

export interface AttributeDataSample {
  id: number;
  ts: Date;
  intvalue: number | null;
  boolvalue: boolean | null;
  objectvalue: object | null;
  datetimevalue: Date | null;
  floatvalue: number | null;
  stringvalue: string | null;
}

export interface AttributeTreeItemProps {
    id: number;
    displayName: string;
    dataType: string;
    dataSource: string;
    fqn: string;
    samples?: AttributeDataSample[]
}

interface AttributeDataQueryVariables {
  ids: string;
  startTime: string;
  endTime: string
}

function AttributeTreeItem({ id, displayName, dataType, dataSource, samples }: AttributeTreeItemProps) {    
  const getValueFromSamples = (samples?: AttributeDataSample[]) => {
    if (samples === undefined) {
      return '#N/A';
    }
    try {
      const lastIndex = samples.length - 1;
      const sample = samples[lastIndex];
      switch (dataType) {
          case 'FLOAT':                                    
              return sample.floatvalue ?? '#N/A';
          case 'STRING':
              return sample.stringvalue ?? '#N/A';
          case 'INT':
              return sample.intvalue ?? '#N/A';
          case 'BOOL':
              return sample.boolvalue ?? '#N/A';
          case 'DATETIME':
              return sample.datetimevalue ?? '#N/A';
          case 'OBJECT':
              return sample.objectvalue ?? '#N/A';
          default:
              return '#N/A';
      }
    } catch (error) {        
        return '#ERR';
    }    
  }

  const [currentValue, setCurrentValue] = useState(getValueFromSamples(samples) ?? '#N/A');
  const [variables, setVariables] = useState<AttributeDataQueryVariables>({
    ids: `[${id}]`,
    startTime: new Date(Date.now() - 3000).toISOString(),
    endTime: new Date(Date.now()).toISOString()
  });
  const { loading, error, data, previousData } = useQuery(GET_ATTRIBUTE_VALUE_QUERY, {
    variables: variables    
  });

  useEffect(() => {
    setTimeout(() => {
      setVariables({
        ids: [`${id}`].toString(),
        startTime: new Date(Date.now() - 3000).toISOString(),
        endTime: new Date(Date.now()).toISOString()
      });
    }, 5000);
  }, [id, variables]);

  useEffect(() => {
    if (error) {
      setCurrentValue("#ERR");
    } else if (data) {      
      setCurrentValue(getValueFromSamples(data?.getRawHistoryDataWithSampling) ?? '#N/A');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, error, loading])

  return (
    <TreeItem nodeId={id.toString()} label={`${displayName} = ${currentValue}`} />
  );
}

export default AttributeTreeItem;
