import Head from 'next/head';
import React, {useState, useEffect} from 'react';
import bustimesData from '../bustime.json';
import styles from '../styles/Home.module.css'

const sortBustimes = () => {
  const sortedBustimes = bustimesData.BustimesWeekday.sort((a, b) => {
    if (a.hour !== b.hour) {
      return a.hour - b.hour;
    }
    return a.minute - b.minute;
  });

  return sortedBustimes;
};


const Clock = () => {
  const [currentTime, setCurrentTime] = useState(null);
  
  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentTime) return null;

  return (
    <div
    className={styles.center}>
      <h1>現在の時刻
      <p>{currentTime.toLocaleTimeString()}</p>
      </h1>
    </div>
  );
};

const GetBustime = () => {
  const [nextBuses, setNextBuses] = useState([]);
  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const findNextBuses = () => {
      const now = new Date();
      setCurrentTime(now);

      const allBustimes = sortBustimes();
      const upcomingBuses = [];
      for (let bus of allBustimes) {
        if (
          (bus.hour > now.getHours()) ||
          (bus.hour === now.getHours() && bus.minute > now.getMinutes())
        ) {
          upcomingBuses.push(bus);
          if (upcomingBuses.length === 5) {
            break; // 5つ先のバスを取得したらループを抜ける
          }
        }
      }
      setNextBuses(upcomingBuses);
    };

    findNextBuses();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      findNextBuses();
    }, 1000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {nextBuses.length > 0 ? (
        <div>
          <p><strong>次の5つのバスの情報は：</strong></p>
          {nextBuses.map((bus, index) => (
            <p key={index}
              className={styles.card}>
              {index === 0 ? (
                <h1>
                  系統： {bus.route}, 行先: {bus.destination}, 時刻: {String(bus.hour).padStart(2, '0')}:{String(bus.minute).padStart(2, '0')}
                </h1>
              ) : (
                <span>系統： {bus.route},行先: {bus.destination}, 時刻: {String(bus.hour).padStart(2, '0')}:{String(bus.minute).padStart(2, '0')}</span>
              )}
            </p>
          ))}
        </div>
      ) : (
        <div>
          今日のバスの時刻はすべて終了しました。
        </div>
      )}
    </div>
  );
}
  
  
  
  
  
  

export default function Home() {
  return (
    <div>
      <Head>
        <title>ページのタイトルです</title>
      </Head>
      <section>
        <div
        className={styles.center}>
         <h1>はこだて未来大学バス停電光掲示板</h1>
        </div>
        
        <Clock />
        <GetBustime />
      </section>
    </div>
  )
}