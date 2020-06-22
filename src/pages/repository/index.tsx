/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import { useRouteMatch, Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../services/api';
import { Header, RepositoryInfo, Issues } from './styles';
import logoImg from '../../assets/logo.svg';

interface RepositoryParams {
  repository: string;
}

interface Repository {
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  owner: {
    avatar_url: string;
    login: string;
  };
}

interface Issue {
  id: number;
  html_url: string;
  title: string;
  user: {
    login: string;
  };
}

const Repository: React.FC = () => {
  const [repository, setRepository] = useState<Repository | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const { params } = useRouteMatch<RepositoryParams>();

  /*
  *****Utilizar o useEffect para atualizar as informações sem async await e com .then*****
  (A ordem de retorno depende da velocidade de resposta para cada chamada)

  useEffect(() => {
    api.get(`/repos/${params.repository}`).then(response => {
      console.log(response.data);
    });
  }, [params.repository]);

  useEffect(() => {
    api.get(`/repos/${params.repository}/issues`).then(response => {
      console.log(response.data);
    });
  }, [params.repository]);
  */

  /*
  *****Utilizar o useEffect para atualizar as informações com async await*****
  (O retorno será feito na ordem definida, o segundo get só retornará após o primeiro finalizar)

  useEffect(() => {
    async function loadData(): Promise<void> {
      const repositories = await api.get(`repos/${params.repository}`);
      const issues = await api.get(`repos/${params.repository}/issues`);
      console.log(repositories);
      console.log(issues);
    }
    loadData();
  }, [params.repository]);
  */

  // Utilizar o useEffect para atualizar as informações com async await e Promise.all
  // O retorno só será feito após as duas chamadas gets finalizarem em conjunto
  useEffect(() => {
    async function loadData(): Promise<void> {
      const [repositories, issue] = await Promise.all([
        await api.get(`repos/${params.repository}`),
        await api.get(`repos/${params.repository}/issues`),
      ]);
      setRepository(repositories.data);
      setIssues(issue.data);
    }

    loadData();
  }, [params.repository]);

  return (
    <>
      <Header>
        <img src={logoImg} alt="Github Explorer" />
        <Link to="/">
          <FiChevronLeft size={16} />
          Voltar
        </Link>
      </Header>

      {repository && (
        <RepositoryInfo>
          <header>
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
            />
            <div>
              <strong>{repository.full_name}</strong>
              <p>{repository.description}</p>
            </div>
          </header>
          <ul>
            <li>
              <strong>{repository.stargazers_count}</strong>
              <span>Stars</span>
            </li>
            <li>
              <strong>{repository.forks_count}</strong>
              <span>Forks</span>
            </li>
            <li>
              <strong>{repository.open_issues_count}</strong>
              <span>Issues abertas</span>
            </li>
          </ul>
        </RepositoryInfo>
      )}

      <Issues>
        {issues.map(issue => (
          <a key={issue.id} href={issue.html_url}>
            <div>
              <strong>{issue.title}</strong>
              <p>{issue.user.login}</p>
            </div>
            <FiChevronRight size={20} />
          </a>
        ))}
      </Issues>
    </>
  );
};

export default Repository;
