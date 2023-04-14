import factory from "../ethereum/Factory";

const FactoryIndex = (props: {lotteries: Array<string>}) => {
    const { lotteries } = props;

    console.log('lotteries', lotteries);
    return <p>Lottery factory</p>
}

export async function getStaticProps() {
    const lotteries = await factory.methods.getDeployedlotteries().call();
    return { props: {lotteries} };
}

export default FactoryIndex;