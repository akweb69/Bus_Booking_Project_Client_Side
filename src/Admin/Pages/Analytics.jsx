import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const Analytics = () => {
    const base_url = import.meta.env.VITE_BASE_URL;
    const [loading, setLoading] = useState(false);
    const [allBookings, setAllBookings] = useState([]);
    const [allCounters, setAllCounters] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedCounter, setSelectedCounter] = useState(null);
    const [selectedCounterBookings, setSelectedCounterBookings] = useState([]);
    const [showCounterModal, setShowCounterModal] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [routeFilter, setRouteFilter] = useState('');
    const [busFilter, setBusFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [sortField, setSortField] = useState('bookingDate');
    const [sortDir, setSortDir] = useState('desc');
    const [bookingsPage, setBookingsPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [bookingsRes, countersRes] = await Promise.all([
                axios.get(`${base_url}/bookings`),
                axios.get(`${base_url}/users`),
            ]);
            setAllBookings(bookingsRes.data);
            setAllCounters(countersRes.data.filter(u => u.role === 'counter'));
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    // Derived data
    const routes = useMemo(() => [...new Set(allBookings.map(b => `${b.fromLocation?.trim()} → ${b.toLocation?.trim()}`))], [allBookings]);
    const buses = useMemo(() => [...new Set(allBookings.map(b => b.busName))], [allBookings]);
    const statuses = useMemo(() => [...new Set(allBookings.map(b => b.status))], [allBookings]);
    const paymentMethods = useMemo(() => [...new Set(allBookings.map(b => b.paymentMethod))], [allBookings]);

    const filteredBookings = useMemo(() => {
        let data = [...allBookings];
        if (dateFrom) data = data.filter(b => b.travelDate >= dateFrom);
        if (dateTo) data = data.filter(b => b.travelDate <= dateTo);
        if (routeFilter) data = data.filter(b => `${b.fromLocation?.trim()} → ${b.toLocation?.trim()}` === routeFilter);
        if (busFilter) data = data.filter(b => b.busName === busFilter);
        if (statusFilter) data = data.filter(b => b.status === statusFilter);
        if (paymentFilter) data = data.filter(b => b.paymentMethod === paymentFilter);
        data.sort((a, b) => {
            let av = a[sortField] ?? '', bv = b[sortField] ?? '';
            if (sortField === 'netPay') { av = Number(av); bv = Number(bv); }
            return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
        });
        return data;
    }, [allBookings, dateFrom, dateTo, routeFilter, busFilter, statusFilter, paymentFilter, sortField, sortDir]);

    const totalRevenue = useMemo(() => filteredBookings.reduce((s, b) => s + Number(b.netPay || 0), 0), [filteredBookings]);
    const confirmedCount = useMemo(() => filteredBookings.filter(b => b.status === 'confirmed').length, [filteredBookings]);

    // Route analytics
    const routeStats = useMemo(() => {
        const map = {};
        filteredBookings.forEach(b => {
            const route = `${b.fromLocation?.trim()} → ${b.toLocation?.trim()}`;
            if (!map[route]) map[route] = { route, count: 0, revenue: 0 };
            map[route].count++;
            map[route].revenue += Number(b.netPay || 0);
        });
        return Object.values(map).sort((a, b) => b.revenue - a.revenue);
    }, [filteredBookings]);

    // Bus analytics
    const busStats = useMemo(() => {
        const map = {};
        filteredBookings.forEach(b => {
            if (!map[b.busName]) map[b.busName] = { bus: b.busName, count: 0, revenue: 0 };
            map[b.busName].count++;
            map[b.busName].revenue += Number(b.netPay || 0);
        });
        return Object.values(map).sort((a, b) => b.revenue - a.revenue);
    }, [filteredBookings]);

    // Counter analytics
    const counterStats = useMemo(() => {
        const map = {};
        filteredBookings.forEach(b => {
            const code = b.counterCode;
            if (!map[code]) map[code] = { counterCode: code, count: 0, revenue: 0 };
            map[code].count++;
            map[code].revenue += Number(b.netPay || 0);
        });
        return Object.values(map).sort((a, b) => b.revenue - a.revenue);
    }, [filteredBookings]);

    // Payment breakdown
    const paymentStats = useMemo(() => {
        const map = {};
        filteredBookings.forEach(b => {
            if (!map[b.paymentMethod]) map[b.paymentMethod] = { method: b.paymentMethod, count: 0, revenue: 0 };
            map[b.paymentMethod].count++;
            map[b.paymentMethod].revenue += Number(b.netPay || 0);
        });
        return Object.values(map);
    }, [filteredBookings]);

    // Daily revenue (last 14 days from filtered)
    const dailyRevenue = useMemo(() => {
        const map = {};
        filteredBookings.forEach(b => {
            const d = b.travelDate;
            if (!map[d]) map[d] = 0;
            map[d] += Number(b.netPay || 0);
        });
        return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-14);
    }, [filteredBookings]);

    const maxDailyRev = Math.max(...dailyRevenue.map(d => d[1]), 1);

    const paginatedBookings = filteredBookings.slice((bookingsPage - 1) * ITEMS_PER_PAGE, bookingsPage * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

    const openCounterModal = (counter) => {
        setSelectedCounter(counter);
        const bks = allBookings.filter(b => b.counterCode === counter.counterID);
        setSelectedCounterBookings(bks);
        setShowCounterModal(true);
    };

    const handleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('desc'); }
    };

    const clearFilters = () => {
        setDateFrom(''); setDateTo(''); setRouteFilter('');
        setBusFilter(''); setStatusFilter(''); setPaymentFilter('');
        setBookingsPage(1);
    };

    const statusBadge = (status) => {
        const colors = { confirmed: '#10b981', cancelled: '#ef4444', pending: '#f59e0b' };
        return (
            <span style={{
                background: colors[status] || '#6b7280',
                color: '#fff', fontSize: '11px', fontWeight: 700,
                padding: '2px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>{status}</span>
        );
    };

    const fmt = (n) => Number(n).toLocaleString('en-BD');

    // ---- STYLES ----
    const S = {
        root: {
            minHeight: '100vh', background: '#0a0e1a', fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
            color: '#e2e8f0', padding: '0'
        },
        header: {
            background: 'linear-gradient(135deg, #0f1629 0%, #1a1f3a 100%)',
            borderBottom: '1px solid rgba(99,102,241,0.2)',
            padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '12px'
        },
        headerTitle: {
            fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px',
            display: 'flex', alignItems: 'center', gap: '10px'
        },
        headerSub: { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },
        refreshBtn: {
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
            border: 'none', borderRadius: '10px', padding: '9px 20px', fontWeight: 700,
            cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px'
        },
        tabs: {
            display: 'flex', gap: '4px', padding: '16px 32px 0',
            borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0d1225',
            overflowX: 'auto', flexWrap: 'nowrap'
        },
        tab: (active) => ({
            padding: '10px 20px', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer',
            fontWeight: active ? 700 : 500, fontSize: '13px', whiteSpace: 'nowrap',
            background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
            color: active ? '#fff' : '#94a3b8', transition: 'all 0.2s', borderBottom: active ? 'none' : '2px solid transparent'
        }),
        content: { padding: '28px 32px', maxWidth: '1600px', margin: '0 auto' },
        // Filters
        filterBox: {
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '20px 24px', marginBottom: '24px',
            display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end'
        },
        filterGroup: { display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '140px', flex: '1' },
        label: { fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
        select: {
            background: '#141828', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            color: '#e2e8f0', padding: '8px 10px', fontSize: '13px', outline: 'none', width: '100%'
        },
        input: {
            background: '#141828', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            color: '#e2e8f0', padding: '8px 10px', fontSize: '13px', outline: 'none', width: '100%'
        },
        clearBtn: {
            background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap'
        },
        // Cards
        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' },
        statCard: (color) => ({
            background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
            border: `1px solid ${color}30`, borderRadius: '16px', padding: '20px',
            position: 'relative', overflow: 'hidden'
        }),
        statLabel: { fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' },
        statValue: (color) => ({ fontSize: '28px', fontWeight: 800, color: color, lineHeight: 1 }),
        statSub: { fontSize: '12px', color: '#64748b', marginTop: '6px' },
        // Table
        tableWrap: {
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px', overflow: 'hidden'
        },
        tableHeader: { padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        tableTitle: { fontSize: '15px', fontWeight: 700, color: '#e2e8f0' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
        th: (sortable) => ({
            padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: '11px',
            color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px',
            borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
            cursor: sortable ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap'
        }),
        td: { padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#cbd5e1', verticalAlign: 'middle' },
        trHover: { background: 'rgba(99,102,241,0.05)' },
        // Bar chart
        barWrap: { display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px', marginTop: '8px' },
        // Pagination
        pagination: { display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center', padding: '16px' },
        pageBtn: (active) => ({
            background: active ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
            color: active ? '#fff' : '#94a3b8', border: 'none', borderRadius: '8px',
            padding: '7px 13px', cursor: 'pointer', fontWeight: 600, fontSize: '13px'
        }),
        // Modal
        overlay: {
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        },
        modal: {
            background: '#0f1629', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '20px',
            width: '100%', maxWidth: '900px', maxHeight: '85vh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column'
        },
        modalHeader: {
            padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        },
        modalClose: {
            background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none',
            borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '13px'
        },
        // Section headers
        sectionHead: { fontSize: '16px', fontWeight: 800, color: '#e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
        grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' },
    };

    const FilterBar = () => (
        <div style={S.filterBox}>
            <div style={S.filterGroup}>
                <span style={S.label}>Date From</span>
                <input type="date" style={S.input} value={dateFrom} onChange={e => { setDateFrom(e.target.value); setBookingsPage(1); }} />
            </div>
            <div style={S.filterGroup}>
                <span style={S.label}>Date To</span>
                <input type="date" style={S.input} value={dateTo} onChange={e => { setDateTo(e.target.value); setBookingsPage(1); }} />
            </div>
            <div style={S.filterGroup}>
                <span style={S.label}>Route</span>
                <select style={S.select} value={routeFilter} onChange={e => { setRouteFilter(e.target.value); setBookingsPage(1); }}>
                    <option value="">All Routes</option>
                    {routes.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <div style={S.filterGroup}>
                <span style={S.label}>Bus</span>
                <select style={S.select} value={busFilter} onChange={e => { setBusFilter(e.target.value); setBookingsPage(1); }}>
                    <option value="">All Buses</option>
                    {buses.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
            </div>
            <div style={S.filterGroup}>
                <span style={S.label}>Status</span>
                <select style={S.select} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setBookingsPage(1); }}>
                    <option value="">All Status</option>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div style={S.filterGroup}>
                <span style={S.label}>Payment</span>
                <select style={S.select} value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setBookingsPage(1); }}>
                    <option value="">All Methods</option>
                    {paymentMethods.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <button style={S.clearBtn} onClick={clearFilters}>✕ Clear</button>
        </div>
    );

    const StatCards = () => (
        <div style={S.statsGrid}>
            {[
                { label: 'Total Bookings', value: filteredBookings.length, sub: `${confirmedCount} confirmed`, color: '#6366f1', icon: '🎫' },
                { label: 'Total Revenue', value: `৳${fmt(totalRevenue)}`, sub: 'Net pay collected', color: '#10b981', icon: '💰' },
                { label: 'Active Routes', value: routeStats.length, sub: 'Unique routes', color: '#f59e0b', icon: '🛣️' },
                { label: 'Bus Fleet', value: busStats.length, sub: 'Operating buses', color: '#ec4899', icon: '🚌' },
                { label: 'Counters', value: counterStats.length, sub: 'Active counters', color: '#14b8a6', icon: '🏢' },
                { label: 'Avg Ticket', value: filteredBookings.length ? `৳${fmt(Math.round(totalRevenue / filteredBookings.length))}` : '৳0', sub: 'Per booking', color: '#8b5cf6', icon: '🎟️' },
            ].map((c, i) => (
                <div key={i} style={S.statCard(c.color)}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{c.icon}</div>
                    <div style={S.statLabel}>{c.label}</div>
                    <div style={S.statValue(c.color)}>{c.value}</div>
                    <div style={S.statSub}>{c.sub}</div>
                </div>
            ))}
        </div>
    );

    // Mini horizontal bar
    const MiniBar = ({ value, max, color }) => (
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '6px', width: '100%', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s' }} />
        </div>
    );

    return (
        <div style={S.root}>
            {/* HEADER */}
            <div style={S.header}>
                <div>
                    <div style={S.headerTitle}>
                        <span style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)', borderRadius: '10px', padding: '6px 10px', fontSize: '18px' }}>📊</span>
                        Analytics Dashboard
                    </div>
                    <div style={S.headerSub}>Real-time booking intelligence & reporting</div>
                </div>
                <button style={S.refreshBtn} onClick={fetchAll} disabled={loading}>
                    {loading ? '⟳ Loading...' : '⟳ Refresh'}
                </button>
            </div>

            {/* TABS */}
            <div style={S.tabs}>
                {[
                    { id: 'overview', label: '⚡ Overview' },
                    { id: 'bookings', label: '📋 All Bookings' },
                    { id: 'routes', label: '🛣️ Routes' },
                    { id: 'buses', label: '🚌 Buses' },
                    { id: 'counters', label: '🏢 Counters' },
                ].map(t => (
                    <button key={t.id} style={S.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>{t.label}</button>
                ))}
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6366f1', fontSize: '18px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
                    <div>Loading analytics data...</div>
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {!loading && (
                <div style={S.content}>
                    {/* ===== OVERVIEW TAB ===== */}
                    {activeTab === 'overview' && (
                        <>
                            <FilterBar />
                            <StatCards />

                            <div style={S.grid2}>
                                {/* Daily Revenue Chart */}
                                <div style={{ ...S.tableWrap, padding: '20px' }}>
                                    <div style={S.sectionHead}>📈 Daily Revenue Trend</div>
                                    {dailyRevenue.length === 0 ? (
                                        <div style={{ color: '#64748b', fontSize: '13px' }}>No data available</div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px', paddingTop: '10px' }}>
                                            {dailyRevenue.map(([date, rev]) => (
                                                <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                                                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>৳{rev >= 1000 ? Math.round(rev / 1000) + 'k' : rev}</span>
                                                    <div style={{
                                                        width: '100%', background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                                                        borderRadius: '4px 4px 0 0', height: `${(rev / maxDailyRev) * 100}px`, minHeight: '4px'
                                                    }} title={`${date}: ৳${fmt(rev)}`} />
                                                    <span style={{ fontSize: '9px', color: '#64748b', transform: 'rotate(-40deg)', transformOrigin: 'center', whiteSpace: 'nowrap' }}>
                                                        {date.slice(5)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Payment Breakdown */}
                                <div style={{ ...S.tableWrap, padding: '20px' }}>
                                    <div style={S.sectionHead}>💳 Payment Methods</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {paymentStats.map((p, i) => {
                                            const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#14b8a6'];
                                            return (
                                                <div key={p.method}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{p.method}</span>
                                                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{p.count} • <strong style={{ color: colors[i % colors.length] }}>৳{fmt(p.revenue)}</strong></span>
                                                    </div>
                                                    <MiniBar value={p.revenue} max={totalRevenue || 1} color={colors[i % colors.length]} />
                                                </div>
                                            );
                                        })}
                                        {paymentStats.length === 0 && <div style={{ color: '#64748b', fontSize: '13px' }}>No data</div>}
                                    </div>
                                </div>
                            </div>

                            {/* Top Routes */}
                            <div style={{ ...S.tableWrap, marginBottom: '28px' }}>
                                <div style={S.tableHeader}>
                                    <span style={S.tableTitle}>🏆 Top Routes by Revenue</span>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={S.table}>
                                        <thead>
                                            <tr>
                                                <th style={S.th(false)}>#</th>
                                                <th style={S.th(false)}>Route</th>
                                                <th style={S.th(false)}>Bookings</th>
                                                <th style={S.th(false)}>Revenue</th>
                                                <th style={S.th(false)}>Share</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {routeStats.slice(0, 8).map((r, i) => (
                                                <tr key={r.route} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                                    <td style={{ ...S.td, color: '#6366f1', fontWeight: 700 }}>#{i + 1}</td>
                                                    <td style={{ ...S.td, fontWeight: 600, color: '#e2e8f0' }}>{r.route}</td>
                                                    <td style={S.td}>{r.count}</td>
                                                    <td style={{ ...S.td, color: '#10b981', fontWeight: 700 }}>৳{fmt(r.revenue)}</td>
                                                    <td style={{ ...S.td, minWidth: '120px' }}>
                                                        <MiniBar value={r.revenue} max={routeStats[0]?.revenue || 1} color="#6366f1" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ===== ALL BOOKINGS TAB ===== */}
                    {activeTab === 'bookings' && (
                        <>
                            <FilterBar />
                            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>{filteredBookings.length} bookings found</span>
                            </div>
                            <div style={S.tableWrap}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={S.table}>
                                        <thead>
                                            <tr>
                                                {[
                                                    { label: '#', field: null },
                                                    { label: 'Passenger', field: 'passengerName' },
                                                    { label: 'Bus', field: 'busName' },
                                                    { label: 'Route', field: 'fromLocation' },
                                                    { label: 'Seat', field: 'seatNumber' },
                                                    { label: 'Travel Date', field: 'travelDate' },
                                                    { label: 'Fare', field: 'netPay' },
                                                    { label: 'Payment', field: 'paymentMethod' },
                                                    { label: 'Counter', field: 'counterCode' },
                                                    { label: 'Status', field: 'status' },
                                                ].map(col => (
                                                    <th key={col.label} style={S.th(!!col.field)} onClick={() => col.field && handleSort(col.field)}>
                                                        {col.label} {col.field && sortField === col.field ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedBookings.map((b, i) => (
                                                <tr key={b._id?.$oid || i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                                    <td style={{ ...S.td, color: '#64748b', fontSize: '11px' }}>{(bookingsPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                                                    <td style={{ ...S.td, fontWeight: 600 }}>
                                                        <div style={{ color: '#e2e8f0' }}>{b.passengerName}</div>
                                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{b.mobile}</div>
                                                    </td>
                                                    <td style={{ ...S.td, color: '#a78bfa' }}>{b.busName}</td>
                                                    <td style={S.td}>
                                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{b.fromLocation?.trim()} →</div>
                                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{b.toLocation?.trim()}</div>
                                                    </td>
                                                    <td style={{ ...S.td, fontWeight: 700, color: '#fbbf24' }}>{b.seatNumber}</td>
                                                    <td style={S.td}>{b.travelDate}</td>
                                                    <td style={{ ...S.td, color: '#10b981', fontWeight: 700 }}>৳{fmt(b.netPay)}</td>
                                                    <td style={S.td}>{b.paymentMethod}</td>
                                                    <td style={{ ...S.td, fontSize: '12px', color: '#94a3b8' }}>{b.counterCode}</td>
                                                    <td style={S.td}>{statusBadge(b.status)}</td>
                                                </tr>
                                            ))}
                                            {paginatedBookings.length === 0 && (
                                                <tr><td colSpan={10} style={{ ...S.td, textAlign: 'center', color: '#64748b', padding: '40px' }}>No bookings match the current filters</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={S.pagination}>
                                        <button style={S.pageBtn(false)} onClick={() => setBookingsPage(p => Math.max(1, p - 1))} disabled={bookingsPage === 1}>‹ Prev</button>
                                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                            const p = bookingsPage <= 4 ? i + 1 : bookingsPage - 3 + i;
                                            if (p < 1 || p > totalPages) return null;
                                            return <button key={p} style={S.pageBtn(p === bookingsPage)} onClick={() => setBookingsPage(p)}>{p}</button>;
                                        })}
                                        <button style={S.pageBtn(false)} onClick={() => setBookingsPage(p => Math.min(totalPages, p + 1))} disabled={bookingsPage === totalPages}>Next ›</button>
                                        <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '8px' }}>Page {bookingsPage} of {totalPages}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ===== ROUTES TAB ===== */}
                    {activeTab === 'routes' && (
                        <>
                            <FilterBar />
                            <StatCards />
                            <div style={S.tableWrap}>
                                <div style={S.tableHeader}>
                                    <span style={S.tableTitle}>🛣️ Route Performance</span>
                                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{routeStats.length} routes</span>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={S.table}>
                                        <thead>
                                            <tr>
                                                <th style={S.th(false)}>#</th>
                                                <th style={S.th(false)}>Route</th>
                                                <th style={S.th(false)}>Total Bookings</th>
                                                <th style={S.th(false)}>Total Revenue</th>
                                                <th style={S.th(false)}>Avg Ticket</th>
                                                <th style={S.th(false)}>Revenue Share</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {routeStats.map((r, i) => (
                                                <tr key={r.route} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                                    <td style={{ ...S.td, color: '#6366f1', fontWeight: 700 }}>#{i + 1}</td>
                                                    <td style={{ ...S.td, fontWeight: 700, color: '#e2e8f0' }}>{r.route}</td>
                                                    <td style={S.td}><span style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1', padding: '3px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '12px' }}>{r.count}</span></td>
                                                    <td style={{ ...S.td, color: '#10b981', fontWeight: 700 }}>৳{fmt(r.revenue)}</td>
                                                    <td style={{ ...S.td, color: '#f59e0b' }}>৳{fmt(Math.round(r.revenue / r.count))}</td>
                                                    <td style={{ ...S.td, minWidth: '160px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <MiniBar value={r.revenue} max={routeStats[0]?.revenue || 1} color="#10b981" />
                                                            <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{totalRevenue ? ((r.revenue / totalRevenue) * 100).toFixed(1) : 0}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ===== BUSES TAB ===== */}
                    {activeTab === 'buses' && (
                        <>
                            <FilterBar />
                            <div style={S.grid2}>
                                {busStats.map((b, i) => {
                                    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6'];
                                    const color = colors[i % colors.length];
                                    const busBookings = filteredBookings.filter(bk => bk.busName === b.bus);
                                    const busRoutes = [...new Set(busBookings.map(bk => `${bk.fromLocation?.trim()} → ${bk.toLocation?.trim()}`))];
                                    return (
                                        <div key={b.bus} style={{ background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)`, border: `1px solid ${color}25`, borderRadius: '16px', padding: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                                <div>
                                                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#e2e8f0' }}>🚌 {b.bus}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{busRoutes.length} route{busRoutes.length !== 1 ? 's' : ''}</div>
                                                </div>
                                                <span style={{ background: `${color}20`, color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>#{i + 1}</span>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px' }}>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>BOOKINGS</div>
                                                    <div style={{ fontSize: '22px', fontWeight: 800, color }}>{b.count}</div>
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px' }}>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>REVENUE</div>
                                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>৳{fmt(b.revenue)}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Routes operated:</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                                {busRoutes.slice(0, 3).map(r => (
                                                    <span key={r} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', color: '#94a3b8' }}>{r}</span>
                                                ))}
                                                {busRoutes.length > 3 && <span style={{ fontSize: '11px', color: '#64748b' }}>+{busRoutes.length - 3} more</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* ===== COUNTERS TAB ===== */}
                    {activeTab === 'counters' && (
                        <>
                            <FilterBar />
                            <div style={{ ...S.tableWrap, marginBottom: '24px' }}>
                                <div style={S.tableHeader}>
                                    <span style={S.tableTitle}>🏢 Counter Performance</span>
                                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{counterStats.length} counters • Click row to view bookings</span>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={S.table}>
                                        <thead>
                                            <tr>
                                                <th style={S.th(false)}>#</th>
                                                <th style={S.th(false)}>Counter Code</th>
                                                <th style={S.th(false)}>Counter Name</th>
                                                <th style={S.th(false)}>Location</th>
                                                <th style={S.th(false)}>Route</th>
                                                <th style={S.th(false)}>Status</th>
                                                <th style={S.th(false)}>Bookings</th>
                                                <th style={S.th(false)}>Revenue</th>
                                                <th style={S.th(false)}>Avg Ticket</th>
                                                <th style={S.th(false)}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {counterStats.map((cs, i) => {
                                                const counterInfo = allCounters.find(c => c.counterID === cs.counterCode);
                                                return (
                                                    <tr key={cs.counterCode} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', cursor: 'pointer' }}
                                                        onClick={() => counterInfo && openCounterModal(counterInfo)}>
                                                        <td style={{ ...S.td, color: '#6366f1', fontWeight: 700 }}>#{i + 1}</td>
                                                        <td style={{ ...S.td, fontWeight: 700 }}>
                                                            <span style={{ background: 'rgba(99,102,241,0.15)', color: '#a78bfa', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}>{cs.counterCode}</span>
                                                        </td>
                                                        <td style={{ ...S.td, color: '#e2e8f0', fontWeight: 600 }}>{counterInfo?.counterName || '—'}</td>
                                                        <td style={{ ...S.td, color: '#94a3b8' }}>{counterInfo?.counterLocation || '—'}</td>
                                                        <td style={{ ...S.td, color: '#94a3b8', fontSize: '12px' }}>{counterInfo?.selectedRoute || '—'}</td>
                                                        <td style={S.td}>
                                                            {counterInfo?.status === 'active'
                                                                ? <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>ACTIVE</span>
                                                                : <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>INACTIVE</span>}
                                                        </td>
                                                        <td style={S.td}>{cs.count}</td>
                                                        <td style={{ ...S.td, color: '#10b981', fontWeight: 700 }}>৳{fmt(cs.revenue)}</td>
                                                        <td style={{ ...S.td, color: '#f59e0b' }}>৳{fmt(Math.round(cs.revenue / cs.count))}</td>
                                                        <td style={S.td}>
                                                            <button onClick={e => { e.stopPropagation(); counterInfo && openCounterModal(counterInfo); }}
                                                                style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '7px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                                                                View Bookings
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Counters not in booking data */}
                            {allCounters.filter(c => !counterStats.find(cs => cs.counterCode === c.counterID)).length > 0 && (
                                <div style={{ ...S.tableWrap }}>
                                    <div style={S.tableHeader}><span style={S.tableTitle}>💤 Counters with No Bookings</span></div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={S.table}>
                                            <thead>
                                                <tr>
                                                    <th style={S.th(false)}>Counter Name</th>
                                                    <th style={S.th(false)}>Counter ID</th>
                                                    <th style={S.th(false)}>Location</th>
                                                    <th style={S.th(false)}>Route</th>
                                                    <th style={S.th(false)}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allCounters.filter(c => !counterStats.find(cs => cs.counterCode === c.counterID)).map((c, i) => (
                                                    <tr key={c._id?.$oid || i}>
                                                        <td style={{ ...S.td, fontWeight: 600, color: '#e2e8f0' }}>{c.counterName}</td>
                                                        <td style={S.td}><span style={{ fontFamily: 'monospace', color: '#a78bfa' }}>{c.counterID}</span></td>
                                                        <td style={S.td}>{c.counterLocation}</td>
                                                        <td style={S.td}>{c.selectedRoute}</td>
                                                        <td style={S.td}>{statusBadge(c.status)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* COUNTER BOOKINGS MODAL */}
            {showCounterModal && selectedCounter && (
                <div style={S.overlay} onClick={() => setShowCounterModal(false)}>
                    <div style={S.modal} onClick={e => e.stopPropagation()}>
                        <div style={S.modalHeader}>
                            <div>
                                <div style={{ fontSize: '17px', fontWeight: 800, color: '#e2e8f0' }}>🏢 {selectedCounter.counterName}</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
                                    ID: <span style={{ fontFamily: 'monospace', color: '#a78bfa' }}>{selectedCounter.counterID}</span> &nbsp;|&nbsp;
                                    {selectedCounter.counterLocation} &nbsp;|&nbsp; {selectedCounter.selectedRoute}
                                </div>
                            </div>
                            <button style={S.modalClose} onClick={() => setShowCounterModal(false)}>✕ Close</button>
                        </div>

                        {/* Counter stats */}
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {[
                                { label: 'Total Bookings', value: selectedCounterBookings.length, color: '#6366f1' },
                                { label: 'Total Revenue', value: `৳${fmt(selectedCounterBookings.reduce((s, b) => s + Number(b.netPay || 0), 0))}`, color: '#10b981' },
                                { label: 'Confirmed', value: selectedCounterBookings.filter(b => b.status === 'confirmed').length, color: '#f59e0b' },
                            ].map(s => (
                                <div key={s.label} style={{ background: `${s.color}15`, border: `1px solid ${s.color}30`, borderRadius: '12px', padding: '12px 20px' }}>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{s.label}</div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: s.color }}>{s.value}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            <table style={S.table}>
                                <thead>
                                    <tr>
                                        <th style={S.th(false)}>#</th>
                                        <th style={S.th(false)}>Passenger</th>
                                        <th style={S.th(false)}>Mobile</th>
                                        <th style={S.th(false)}>Bus</th>
                                        <th style={S.th(false)}>Route</th>
                                        <th style={S.th(false)}>Seat</th>
                                        <th style={S.th(false)}>Travel Date</th>
                                        <th style={S.th(false)}>Fare</th>
                                        <th style={S.th(false)}>Payment</th>
                                        <th style={S.th(false)}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedCounterBookings.length === 0 ? (
                                        <tr><td colSpan={10} style={{ ...S.td, textAlign: 'center', color: '#64748b', padding: '40px' }}>No bookings found for this counter</td></tr>
                                    ) : (
                                        selectedCounterBookings.map((b, i) => (
                                            <tr key={b._id?.$oid || i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                                                <td style={{ ...S.td, color: '#64748b', fontSize: '11px' }}>{i + 1}</td>
                                                <td style={{ ...S.td, fontWeight: 600, color: '#e2e8f0' }}>{b.passengerName}</td>
                                                <td style={{ ...S.td, fontSize: '12px', color: '#94a3b8' }}>{b.mobile}</td>
                                                <td style={{ ...S.td, color: '#a78bfa' }}>{b.busName}</td>
                                                <td style={{ ...S.td, fontSize: '12px', color: '#94a3b8' }}>{b.fromLocation?.trim()} → {b.toLocation?.trim()}</td>
                                                <td style={{ ...S.td, fontWeight: 700, color: '#fbbf24' }}>{b.seatNumber}</td>
                                                <td style={S.td}>{b.travelDate}</td>
                                                <td style={{ ...S.td, color: '#10b981', fontWeight: 700 }}>৳{fmt(b.netPay)}</td>
                                                <td style={S.td}>{b.paymentMethod}</td>
                                                <td style={S.td}>{statusBadge(b.status)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;