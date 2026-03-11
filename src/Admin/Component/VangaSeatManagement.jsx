import React, { useState } from 'react';

const bookedSeats = ['A1', 'B3', 'EX1', 'J5', 'C2', 'D4', 'F1', 'GD1', 'EX3'];

const getSeatStatus = (seat) => bookedSeats.includes(seat) ? 'booked' : 'available';

const Seat = ({ id, onClick }) => {
    const status = getSeatStatus(id);
    const isBooked = status === 'booked';

    return (
        <div
            onClick={() => onClick(id)}
            title={id}
            style={{
                background: isBooked
                    ? 'linear-gradient(145deg, #ff6b6b, #ee5a24)'
                    : 'linear-gradient(145deg, #55efc4, #00b894)',
                boxShadow: isBooked
                    ? '0 4px 0 #c0392b, 0 6px 8px rgba(231,76,60,0.3)'
                    : '0 4px 0 #00916e, 0 6px 8px rgba(0,184,148,0.3)',
                cursor: 'pointer',
                borderRadius: '8px 8px 4px 4px',
                transition: 'all 0.12s ease',
                userSelect: 'none',
            }}
            className="w-full aspect-square flex items-center justify-center text-white font-bold text-xs
                        hover:brightness-110 active:translate-y-1 active:shadow-none"
            onMouseDown={e => e.currentTarget.style.transform = 'translateY(3px)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {id}
        </div>
    );
};

const EmptyCell = () => <div className="w-full aspect-square" />;

const VangaSeatLayout = () => {
    const [selectedSeat, setSelectedSeat] = useState(null);

    const handleSeatClick = (seat) => setSelectedSeat(seat);
    const closeModal = () => setSelectedSeat(null);

    return (
        <>
            {/* ── BUS BODY ── */}
            <div style={{
                background: 'linear-gradient(160deg, #2d3436 0%, #1e272e 100%)',
                borderRadius: '24px',
                padding: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.07)',
                maxWidth: '280px',
                margin: '0 auto',
                fontFamily: "'Segoe UI', sans-serif",
            }}>

                {/* headlights row */}
                <div className="flex justify-between items-center mb-3 px-1">
                    <div className="flex gap-1.5">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fdcb6e', boxShadow: '0 0 8px #fdcb6e' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fdcb6e', boxShadow: '0 0 8px #fdcb6e' }} />
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase' }}>Driver</span>
                    <div className="flex gap-1.5">
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fdcb6e', boxShadow: '0 0 8px #fdcb6e' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fdcb6e', boxShadow: '0 0 8px #fdcb6e' }} />
                    </div>
                </div>

                {/* divider */}
                <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', marginBottom: 12 }} />

                {/* col headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5, marginBottom: 6, paddingLeft: 2, paddingRight: 2 }}>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '9px', textAlign: 'center' }}>1</span>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '9px', textAlign: 'center' }}>2</span>
                    <span style={{ color: 'rgba(255,255,255,0.08)', fontSize: '9px', textAlign: 'center' }}>·</span>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '9px', textAlign: 'center' }}>3</span>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '9px', textAlign: 'center' }}>4</span>
                </div>

                {/* SEAT GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>

                    {/* EX row 1 */}
                    <EmptyCell /><EmptyCell />
                    <Seat id="EX1" onClick={handleSeatClick} />
                    <Seat id="EX2" onClick={handleSeatClick} />
                    <EmptyCell />

                    {/* GD / EX row 2 */}
                    <Seat id="GD1" onClick={handleSeatClick} />
                    <EmptyCell />
                    <Seat id="EX3" onClick={handleSeatClick} />
                    <Seat id="EX4" onClick={handleSeatClick} />
                    <EmptyCell />

                    {/* thin divider row */}
                    {[...Array(5)].map((_, i) => (
                        <div key={i} style={{ height: 1, background: i === 2 ? 'transparent' : 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 2 }} />
                    ))}

                    {/* A → I rows */}
                    {Array.from('ABCDEFGHI').map(letter => (
                        <React.Fragment key={letter}>
                            <Seat id={`${letter}1`} onClick={handleSeatClick} />
                            <Seat id={`${letter}2`} onClick={handleSeatClick} />
                            {/* aisle */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: 1, height: '100%', background: 'rgba(255,255,255,0.06)' }} />
                            </div>
                            <Seat id={`${letter}3`} onClick={handleSeatClick} />
                            <Seat id={`${letter}4`} onClick={handleSeatClick} />
                        </React.Fragment>
                    ))}

                    {/* J row */}
                    <Seat id="J1" onClick={handleSeatClick} />
                    <Seat id="J2" onClick={handleSeatClick} />
                    <Seat id="J5" onClick={handleSeatClick} />
                    <Seat id="J3" onClick={handleSeatClick} />
                    <Seat id="J4" onClick={handleSeatClick} />
                </div>

                {/* divider */}
                <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', margin: '12px 0 10px' }} />

                {/* legend */}
                <div className="flex justify-center gap-5">
                    {[
                        { color: '#00b894', label: 'Available' },
                        { color: '#ee5a24', label: 'Booked' },
                    ].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-1.5">
                            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── MODAL ── */}
            {selectedSeat && (
                <div
                    onClick={closeModal}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 50,
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(6px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#fff',
                            borderRadius: 20,
                            padding: '36px 48px',
                            textAlign: 'center',
                            boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
                            animation: 'popIn 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                            fontFamily: "'Segoe UI', sans-serif",
                        }}
                    >
                        <p style={{ fontSize: 11, letterSpacing: 4, color: '#aaa', textTransform: 'uppercase', marginBottom: 8 }}>Seat Number</p>
                        <p style={{
                            fontSize: 72,
                            fontWeight: 900,
                            lineHeight: 1,
                            color: getSeatStatus(selectedSeat) === 'booked' ? '#ee5a24' : '#00b894',
                            fontFamily: 'Georgia, serif',
                            marginBottom: 12,
                        }}>
                            {selectedSeat}
                        </p>
                        <span style={{
                            display: 'inline-block',
                            padding: '4px 14px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: getSeatStatus(selectedSeat) === 'booked' ? '#ffeaa7' : '#d4fce9',
                            color: getSeatStatus(selectedSeat) === 'booked' ? '#d35400' : '#00916e',
                            marginBottom: 20,
                        }}>
                            {getSeatStatus(selectedSeat) === 'booked' ? '🔴 Booked' : '🟢 Available'}
                        </span>
                        <br />
                        <button
                            onClick={closeModal}
                            style={{
                                marginTop: 4,
                                background: 'none', border: 'none',
                                color: '#bbb', fontSize: 12, cursor: 'pointer',
                            }}
                        >
                            tap anywhere to close
                        </button>
                    </div>

                    <style>{`
                        @keyframes popIn {
                            from { transform: scale(0.7); opacity: 0; }
                            to   { transform: scale(1);   opacity: 1; }
                        }
                    `}</style>
                </div>
            )}
        </>
    );
};

export default VangaSeatLayout;