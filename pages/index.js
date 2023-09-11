import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import bustimesData from '../bustime.json';
import styles from '../styles/Home.module.css';
import holidayJp from 'japanese-holidays';

const isItWeekend = () => {
  const currentDate = new Date();
  const dayOfWeek = currentDate.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

const isItHoliday = () => {
  const currentDate = new Date();
  return holidayJp.isHoliday(currentDate);
};

const DiagramChecker = () => {
  const isWeekendorHoliday = isItWeekend() || isItHoliday();
  return (
    <div className={styles.center}>
      <h2>
        <p>{isWeekendorHoliday ? '休日ダイヤ' : '平日ダイヤ'}</p>
      </h2>
    </div>
  );
};

const sortBustimes = () => {
  const todaybustime = (isItWeekend() || isItHoliday())
    ? bustimesData.BustimesHoliday
    : bustimesData.BustimesWeekday;
  const sortedBustimes = todaybustime.sort((a, b) => {
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
    <div className={`${styles.center}
        ${styles.underline }
        `}>
      <h1>
        現在の時刻
        <p>{currentTime.toLocaleTimeString()}</p>
      </h1>
    </div>
  );
};

const GetBustime = () => {
  const [nextBuses, setNextBuses] = useState([]);
  const [currentTime, setCurrentTime] = useState(null);
  const [openPanel, setOpenPanel] = useState(null);

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
          /*
          if (upcomingBuses.length === 5) {
            break; // 5つ先のバスを取得したらループを抜ける
          }
          */
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

  const togglePanel = (index) => {
    if (openPanel === index) {
      setOpenPanel(null);
    } else {
      setOpenPanel(index);
    }
  };

  return (
    <div>
      {nextBuses.length > 0 ? (
        <div className={styles.font}>
          <p>
            <strong>大学前のバス停情報：</strong>
          </p>
          {nextBuses.map((bus, index) => (
            <div key={index} className={`${styles.card} 
            ${bus.destination === "赤川" ? styles.akagawa : ''}
            ${bus.destination === "千代台" ? styles.chiyogadai : ''}
            ${bus.destination === "昭和ターミナル" ? styles.syouwa : ''}
            ${bus.destination === "亀田支所前" ? styles.kamedasisyo : ''}
            ${bus.destination === "小川の里" ? styles.ogawanosato : ''}
            ${bus.destination === "函館駅前" ? styles.hakodateSta : ''}`}
            
            >
              <div onClick={() => togglePanel(index)}>
                <div className={styles['keitou']}>{bus.route} 系統</div>
                <p>
                  <span className={styles.ikisaki}>{bus.destination} 行き{'　'.repeat(7 - bus.destination.length)}</span>
                  <span className={styles.time}>{String(bus.hour).padStart(2, '0')}:{String(bus.minute).padStart(2, '0')}</span>
                </p>

              </div>
              {openPanel === index && (
                <div className={styles.panelContent}>
                  <p>こんにちは</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.center}>
          今日のバスの時刻はすべて終了しました。
        </div>
      )}
    </div>
  );
};

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>はこだて未来大学バス停情報</title>
      </Head>
      <section>
        <div className={`${styles.center}
        ${styles.underline }
        `}>
        
          <h1>はこだて未来大バス停情報</h1>
        </div>

        <Clock />
        <DiagramChecker />
        <GetBustime />
      </section>
    </div>
  );
}
