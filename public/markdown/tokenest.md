```
:::::::::::  ::::::::  :::    ::: :::::::::: :::    :::: ::::::::::  ::::::::  :::::::::::
    :+:     :+:    :+: :+:   :+:  :+:        :+:   +::+: :+:        :+:    :+:     :+:
    +:+     +:+    +:+ +:+  +:+   +:+        :+:  +:++:+ +:+        +:+            +:+
    +#+     +#+    +:+ +#++:++    +#++:++#   +#+ +:+ +#+ +#++:++#   +#++:++#++     +#+
    +#+     +#+    +#+ +#+  +#+   +#+        +#++#+  #+# +#+               +#+     +#+
    #+#     #+#    #+# #+#   #+#  #+#        #+##+   #+# #+#        #+#    #+#     #+#
    ###      ########  ###    ### ########## ####    ### ##########  ########      ###
```

# ♦️Introduce TokeИest!!♦️

**TokeИest**는 블록체인 기반의 탈중앙화 금융 시스템인 DeFi(Decentralized finance)를 구축해 물가 변동의 문제를 최소화하고자 개발되었습니다.

기존 시장은 생산자(기업)과 소비자(손님) 간의 상품 가격의 마찰이 끊이지 않고 있습니다. 생산자는 수입 계약의 문제, 인플레이션의 문제 등을 고려해 가격을 책정하고, 결국 소비자의 체감보다 비싸게 상품을 판매할 수 밖에 없습니다.

이에 대한 해결책으로 **TokeИest**가 개발되었습니다. DeFi 프로젝트를 구축해 실시간 물가에 맞춰 거래가 일어나고, 물가의 변동률에 맞춰 가격이 조정되게 됩니다. 결국 인플레이션 문제와 주기별 수입 계약의 문제를 최소화할 수 있으며, 생산자와 소비자 간의 합리적인 교류가 일어날 것이라 기대합니다.

**TokeИest**는 현재 Klaytn 네트워크에서 동작 가능한 SmartContrat 프로젝트를 구축했으며, NextJs를 활용하여 키오스크에서 TokeИest기술에 대한 활용 방안을 제시해주는 프로젝트를 구축했습니다.

아래 두 리포지토리를 활용하면 어떤 상품이든 손쉽게 토큰화하여 실시간 물가에 대응하는 시스템을 구현할 수 있습니다. 기능에 대한 자세한 설명은 각 리포지토리의 README.md를 참조 바랍니다.

**TokeИest-SmartContract Repository**: [TokeИest-SmartContract](https://github.com/TokeNest/TokeNest_SmartContract)

**TokeИest-NextJs Repository**: [TokeИest-NextJs](https://github.com/TokeNest/TokeNest_Next.js)

# TokeИest Architecture 😎

![TokeИest 2K](https://github.com/TokeNest/.github/assets/66249549/424b24ad-d3a6-4c0a-8567-e57025ec307c)

TokeИest의 전반적인 구조를 보여주는 아키텍쳐 입니다.

`Seller`가 `Buyer`에게 상품을 판매하기 위해선 `TokeИest dApps`를 통해 거래가 일어나며, 아래 Scenario와 같이 동작합니다.

## Scenario 📚

1. **토큰화**: 판매자는 실물 자산에 대응하는 토큰을 생성하고 블록체인에 상장합니다.
2. **스왑**: 구매자는 DEX에서 토큰을 구매하기 위해 스테이블 코인을 사용하여 스왑합니다.
3. **NFT 발급**: 구매자는 토큰을 실물 자산으로 교환하기 위해 NFT를 발급받습니다. (기능 구현중)
4. **NFT 소각**: 거래가 완료되면 NFT를 소각하여 실물 자산을 수령합니다. (기능 구현중)
5. **완제품 생산**: 구매자는 실물 자산을 가공하여 완제품으로 생산하고 판매합니다.
6. **키오스크 시스템**: 소비자는 실시간 물가를 추적하고 합리적인 가격으로 제품을 구매하기 위한 키오스크 시스템을 이용합니다. ([TokeИest-Next.js](https://github.com/TokeNest/TokeNest_Next.js))

TokeИest SmartContract의 자세한 동작과정에 대해선 아래 문서를 참조하세요.
[dex-specification](./docs/dex-specification.md)

## Main Mechanisms 🧐

- **실시간 가격 조정**: 물가 변동을 실시간으로 추적하고 가격을 조정하여 공정한 거래를 제공합니다.
- **토큰화된 실물 자산**: 물가 변동에 실시간으로 거래되는 토큰화된 실물 자산을 거래할 수 있습니다.
- **신뢰성과 투명성**: 블록체인의 탈중앙화된 분산 장부로 모든 거래 내용을 투명하게 기록하고 공개합니다.
- **유통과정 간소화**: 스마트 컨트랙트를 활용하여 거래를 자동화하고 유통 과정을 간소화합니다.

# TechStack 🤩

![image](https://github.com/TokeNest/.github/assets/77330457/b9015598-b07e-4aa2-a351-be80800dbca2)

### Programming Languages

![Solidity](https://img.shields.io/badge/solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

### Frameworks

![React](https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)

### Database

![MongoDB](https://img.shields.io/badge/mongodb-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

### Tools

![WebStorm](https://img.shields.io/badge/webstorm-000000?style=for-the-badge&logo=webstorm&logoColor=white)
![Docker](https://img.shields.io/badge/docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Notion](https://img.shields.io/badge/notion-000000?style=for-the-badge&logo=notion&logoColor=white)
![GitHub](https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white)
![Trello](https://img.shields.io/badge/trello-0052CC?style=for-the-badge&logo=trello&logoColor=white)
![Slack](https://img.shields.io/badge/slack-4A154B?style=for-the-badge&logo=slack&logoColor=white)
![Figma](https://img.shields.io/badge/figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)

## Contributor

- [kang1027](https://github.com/kang1027)
- [choiht0904](https://github.com/choiht0904)
- [kecan0406](https://github.com/kecan0406)
