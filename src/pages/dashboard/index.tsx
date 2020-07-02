/* eslint-disable camelcase */
import React, { useState, useEffect, FormEvent, MouseEvent } from 'react';
import { FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../services/api';

import { Title, Form, Repositories, Error } from './styles';
import logoImg from '../../assets/logo.svg';

interface Repository {
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

const Dashboard: React.FC = () => {
  const [newRepo, setNewRepo] = useState('');
  const [inputError, setInputError] = useState('');

  const [repositories, setRepositories] = useState<Repository[]>(() => {
    const storagedRepos = localStorage.getItem('@GithubExplorer:repositories');
    if (storagedRepos) {
      return JSON.parse(storagedRepos);
    }
    return [];
  });

  /* A parte de localStorage acima também pode ser feita da seguinte forma:

    useEffect(() => {
    const storagedRepos = localStorage.getItem('@GithubExplorer:repositories');
    if (storagedRepos) {
      setRepositories(JSON.parse(storagedRepos));
    }
  }, []); */

  useEffect(() => {
    localStorage.setItem(
      '@GithubExplorer:repositories',
      JSON.stringify(repositories),
    );
  }, [repositories]);

  async function handleAddRepository(
    e: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault();

    if (!newRepo) {
      setInputError(
        'Busque o respositório com o formato: usuário/nome-do-repositório',
      );
      return;
    }

    try {
      const response = await api.get<Repository>(`/repos/${newRepo}`);
      const repository = response.data;
      setRepositories([...repositories, repository]);
      setNewRepo('');
      setInputError('');
    } catch (err) {
      setInputError('Erro na busca por este repositório!');
    }
  }

  async function handleDeleteRepository(
    e: MouseEvent<HTMLButtonElement>,
    name: string,
  ): Promise<void> {
    e.preventDefault();

    const filteredRepositories = repositories.filter(
      repository => repository.full_name !== name,
    );

    setRepositories(filteredRepositories);
  }

  return (
    <>
      <img src={logoImg} alt="Github explorer" />
      <Title>Buscador de repositórios no GitHub</Title>
      <Form hasError={!!inputError} onSubmit={handleAddRepository}>
        <input
          value={newRepo}
          onChange={e => setNewRepo(e.target.value)}
          placeholder="Faça uma busca com o formato: usuário/nome-do-repositório"
        />
        <button type="submit">Pesquisar</button>
      </Form>

      {inputError && <Error>{inputError}</Error>}

      <Repositories>
        {repositories.map(repository => (
          <>
            <Link
              key={repository.full_name}
              to={`/repository/${repository.full_name}`}
            >
              <img
                src={repository.owner.avatar_url}
                alt={repository.owner.login}
              />
              <div>
                <strong>{repository.full_name}</strong>
                <p>{repository.description}</p>
              </div>
              <FiChevronRight size={20} />
            </Link>
            <button
              type="button"
              onClick={e => handleDeleteRepository(e, repository.full_name)}
            >
              <FiTrash2 size={24} color="#fff" />
            </button>
          </>
        ))}
      </Repositories>
    </>
  );
};

export default Dashboard;
