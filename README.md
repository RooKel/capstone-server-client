# capstone-server-client

테스트 환경세팅
1.	프로젝트 zip 파일을 다운로드 받고 압축을 해제한다.
2.	터미널에서 해당 프로젝트의 package.json가 있는 경로에 들어가 다음과 같이 입력한다.
```
$ npm install
$ npm run build
```
3.	클라이언트는 http://localhost:3000/ 에서, 에디터는 http://localhost:3000/editor 에서 기동할 수 있다.



클라이언트에서 테스트하기 전에 우선 에디터에서 아바타와 월드를 업로드해야 한다.
1.	http://localhost:3000/editor 에 접속한다.
2.	좌측 상단의 Add를 눌러 Directional Light를 추가한다.
3.	본인이 업로드하고자 하는 월드/아바타 객체를 배치한다. 
(외부 모델 파일 로드도 가능하며, GLTF 포맷 파일을 권장한다.)
4.	좌측 상단의 File - Upload (World/Avatar) 를 누르면 업로드가 진행된다.
5.	업로드 완료 후 클라이언트 http://localhost:3000/ 에서 확인할 수 있다.
