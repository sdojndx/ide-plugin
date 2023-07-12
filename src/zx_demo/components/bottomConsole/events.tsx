import useAppStore from '@/zx_demo/store';
import React from 'react';

export default function IDEEvents({ style }: {
  style?: React.CSSProperties;
}) {
  const { eventData } = useAppStore();
  return (
    <div className='ideevent' style={style}>
      <table>
        <tbody>
          <tr className="header">
            <td>Number</td>
            <td>Topic</td>
            <td>Event data</td>
          </tr>
          {
            eventData.map((item, idx) => (
              <tr key={idx}>
                <td className="number">{idx + 1}</td>
                <td className="topic">{item.topic}</td>
                <td>
                  {
                    item.data.map((i, idx) => (<p key={idx}>{i}</p>))
                  }
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
