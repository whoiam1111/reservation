import SlotList from './components/SlotList';

export default function Page() {
    return (
        <main style={{ padding: 24 }}>
            <h1>예약 페이지</h1>
            <p>아래에서 예약 가능한 시간을 선택하세요.</p>
            <SlotList />
        </main>
    );
}
